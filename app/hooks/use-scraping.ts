import { useRef, useCallback } from "react";
import { useAtom } from "jotai";
import { articlesAtom } from "~/atoms/article";
import {
  crawlStatusAtom,
  progressInfoAtom,
  scrapingErrorMessageAtom,
  scrapingJobIdAtom,
} from "~/atoms/scraping";
import { useToast } from "~/hooks/use-toast";
import type { UseScrapingReturn, StartScrapingParams } from "~/types/scraping";
import {
  startScrapingApi,
  cancelScrapingApi,
} from "~/services/scraping.client";
import { processScrapingStream } from "~/utils/stream-processor.client";

/**
 * スクレイピング機能を提供するカスタムフック
 * 
 * @param token - 認証トークン
 * @returns スクレイピング開始・中断機能を提供するオブジェクト
 */
export function useScraping(token: string | null) {
  // Jotai atomを使用した状態管理
  const [, setCrawlStatus] = useAtom(crawlStatusAtom);
  const [, setProgressInfo] = useAtom(progressInfoAtom);
  const [, setGlobalScrapingResults] = useAtom(articlesAtom);
  const [, setErrorMessage] = useAtom(scrapingErrorMessageAtom);
  const [jobId, setJobId] = useAtom(scrapingJobIdAtom);
  
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 状態をリセットする内部関数
   */
  const resetState = useCallback(() => {
    setCrawlStatus("idle");
    setJobId(null);
    setProgressInfo(null);
  }, [setCrawlStatus, setJobId, setProgressInfo]);

  /**
   * AbortControllerをクリーンアップする内部関数
   */
  const cleanupAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log("Fetch aborted by frontend.");
    }
  }, []);

  /**
   * ジョブIDを抽出する内部関数
   */
  const extractJobId = useCallback((response: Response): string | null => {
    const allHeaders = [...response.headers.entries()];
    console.log("All response headers:", allHeaders);

    // ヘッダーからジョブIDを検索
    for (const [key, value] of allHeaders) {
      if (key.toLowerCase() === "x-job-id") {
        return value;
      }
    }

    // フォールバック検索
    return response.headers.get("x-job-id") || 
           response.headers.get("X-Job-ID");
  }, []);  /**
   * スクレイピング処理を中断する
   * @param isNavigating - ページ遷移による中断かどうか
   */
  const cancelScraping = useCallback(
    async (isNavigating = false) => {
      if (!jobId) {
        console.warn("Cannot cancel scraping: Job ID is not set.");
        resetState();
        cleanupAbortController();
        
        if (!isNavigating) {
          toast({
            title: "中断処理",
            description: "スクレイピング処理を中断しました（ジョブID不明）。",
            variant: "destructive",
          });
        }
        return;
      }

      console.log(`Attempting to cancel job: ${jobId}`);
      cleanupAbortController();

      try {
        const stopResponse = await cancelScrapingApi({ jobId });
        const result = await stopResponse.json();

        if (stopResponse.ok) {
          console.log(`Stop signal sent successfully for job: ${jobId}`);
          if (!isNavigating) {
            toast({
              title: "中断リクエスト送信",
              description:
                result.message ||
                `スクレイピングジョブ ${jobId} の中断リクエストを送信しました。`,
            });
          }
        } else {
          console.error(`Failed to send stop signal for job: ${jobId}`, result);
          if (!isNavigating) {
            toast({
              title: "中断リクエスト失敗",
              description:
                result.detail || `ジョブ ${jobId} の中断に失敗しました。`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error(
          `Error calling cancelScrapingApi for job: ${jobId}`,
          error
        );
        if (!isNavigating) {
          toast({
            title: "中断リクエストエラー",
            description: `ジョブ ${jobId} の中断リクエスト送信中に予期せぬエラーが発生しました。`,
            variant: "destructive",
          });
        }
      } finally {
        resetState();
      }
    },
    [jobId, toast, resetState, cleanupAbortController]
  );
  /**
   * スクレイピング処理を開始する
   * @param values - スクレイピング実行パラメータ
   */
  const startScraping = useCallback(
    async (values: StartScrapingParams) => {
      console.log("Starting scraping, resetting state using atoms...");
      
      // 状態をリセット
      setCrawlStatus("running");
      setProgressInfo(null);
      setErrorMessage(null);
      setJobId(null);
      setGlobalScrapingResults([]);
      abortControllerRef.current = new AbortController();

      try {
        // APIクライアント関数を呼び出す
        const response = await startScrapingApi({
          startUrl: values.startUrl,
          targetClass: values.targetClass,
          token,
          signal: abortControllerRef.current.signal,
        });

        // レスポンスヘッダーからJob IDを取得
        const currentJobId = extractJobId(response);

        if (currentJobId) {
          console.log("Received Job ID:", currentJobId);
          setJobId(currentJobId);
          toast({
            title: "スクレイピング開始",
            description: `ジョブID: ${currentJobId}`,
          });
        } else {
          console.warn("X-Job-ID header not found in response.");
          toast({
            title: "警告",
            description:
              "ジョブIDが取得できませんでした。中断機能が使用できません。",
            variant: "destructive",
          });
        }

        if (!response.body) {
          throw new Error("レスポンスボディがありません");
        }

        const reader = response.body.getReader();

        // ストリーム処理を開始
        await processScrapingStream(reader, {
          onStatus: (message) => {
            setProgressInfo({ message, processedPages: 0, elapsedTime: 0 });
          },
          onProgress: (progress) => {
            setProgressInfo(progress);
          },
          onData: (article) => {
            setGlobalScrapingResults((prev) => [...prev, article]);
          },
          onCompletion: (completionInfo) => {
            setProgressInfo((prev) => ({
              ...(prev ?? { message: "", processedPages: 0, elapsedTime: 0 }),
              ...completionInfo,
            }));
            console.log("Scraping completed.");
            setCrawlStatus("completed");
          },
          onError: (errorMsg) => {
            setErrorMessage(errorMsg);
            setCrawlStatus("error");
          },
          onStreamEnd: () => {
            setCrawlStatus("completed");
            console.log("Stream ended unexpectedly.");
          },
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Fetch aborted.");
          setCrawlStatus("idle");
          setProgressInfo(null);
        } else {
          console.error("Scraping request failed:", err);
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "スクレイピングリクエストの送信中にエラーが発生しました"
          );
          setCrawlStatus("error");
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      token,
      setGlobalScrapingResults,
      toast,
      setCrawlStatus,
      setProgressInfo,
      setErrorMessage,
      setJobId,
      extractJobId,
    ]
  );
  // フックは状態を直接返さず、アクション関数のみを返す
  return {
    startScraping,
    cancelScraping,
  };
}
