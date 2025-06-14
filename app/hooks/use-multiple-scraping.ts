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
import {
  startMultipleScrapingApi,
  cancelScrapingApi,
  updateArticlesToBackend,
} from "~/services/scraping.client";
import { processScrapingStream } from "~/utils/stream-processor.client";
import type { ArticleMinimalItem } from "~/types/article";

interface StartMultipleScrapingParams {
  selectedArticles: ArticleMinimalItem[];
  targetClass: string;
  projectId: number;
  token: string;
}

/**
 * 複数URLスクレイピング機能を提供するカスタムフック
 */
export function useMultipleScraping() {
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
      console.log("Multiple scraping fetch aborted by frontend.");
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
  }, []);

  /**
   * スクレイピング処理を中断する
   * @param isNavigating - ページ遷移による中断かどうか
   */
  const cancelScraping = useCallback(
    async (isNavigating = false) => {
      if (!jobId) {
        console.warn("Cannot cancel multiple scraping: Job ID is not set.");
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

      console.log(`Attempting to cancel multiple scraping job: ${jobId}`);
      cleanupAbortController();

      try {
        const stopResponse = await cancelScrapingApi({ jobId });
        const result = await stopResponse.json();

        if (stopResponse.ok) {
          console.log(`Stop signal sent successfully for multiple scraping job: ${jobId}`);
          if (!isNavigating) {
            toast({
              title: "中断リクエスト送信",
              description:
                result.message ||
                `複数URLスクレイピングジョブ ${jobId} の中断リクエストを送信しました。`,
            });
          }
        } else {
          console.error(`Failed to send stop signal for multiple scraping job: ${jobId}`, result);
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
          `Error calling cancelScrapingApi for multiple scraping job: ${jobId}`,
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
   * 複数URLスクレイピング処理を開始する
   * @param params - スクレイピング実行パラメータ
   */
  const startMultipleScraping = useCallback(
    async (params: StartMultipleScrapingParams) => {
      const { selectedArticles, targetClass, projectId, token } = params;
      
      console.log("Starting multiple scraping, resetting state using atoms...");
      
      // 状態をリセット
      setCrawlStatus("running");
      setProgressInfo(null);
      setErrorMessage(null);
      setJobId(null);
      setGlobalScrapingResults([]);
      abortControllerRef.current = new AbortController();

      try {
        const startUrls = selectedArticles.map(article => article.articleUrl);
        
        // 複数URLスクレイピングAPIを呼び出す
        const response = await startMultipleScrapingApi({
          startUrls,
          targetClass,
          signal: abortControllerRef.current.signal,
        });

        // レスポンスヘッダーからJob IDを取得
        const currentJobId = extractJobId(response);

        if (currentJobId) {
          console.log("Received Multiple Scraping Job ID:", currentJobId);
          setJobId(currentJobId);
          toast({
            title: "複数URLスクレイピング開始",
            description: `${selectedArticles.length}件の記事をスクレイピング中... (ジョブID: ${currentJobId})`,
          });
        } else {
          console.warn("X-Job-ID header not found in multiple scraping response.");
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
        const scrapedArticles: any[] = [];

        // ストリーム処理を開始
        await processScrapingStream(reader, {
          onStatus: (message) => {
            setProgressInfo({ message, processedPages: 0, elapsedTime: 0 });
          },
          onProgress: (progress) => {
            setProgressInfo(progress);
          },
          onData: (article) => {
            scrapedArticles.push(article);
            setGlobalScrapingResults((prev) => [...prev, article]);
          },
          onCompletion: async (completionInfo) => {
            setProgressInfo((prev) => ({
              ...(prev ?? { message: "", processedPages: 0, elapsedTime: 0 }),
              ...completionInfo,
            }));
            console.log("Multiple scraping completed.");
            
            // バックエンドAPIに保存（既存記事の更新）
            if (scrapedArticles.length > 0) {
              try {
                // スクレイピング結果を既存記事の更新形式に変換
                const articlesToUpdate = scrapedArticles.map(scrapedArticle => {
                  // URLから既存記事のIDを取得
                  const existingArticle = selectedArticles.find(
                    article => article.articleUrl === scrapedArticle.articleUrl
                  );
                  
                  if (!existingArticle) {
                    throw new Error(`記事が見つかりません: ${scrapedArticle.articleUrl}`);
                  }

                  return {
                    id: existingArticle.id,
                    articleUrl: scrapedArticle.articleUrl,
                    metaTitle: scrapedArticle.metaTitle,
                    metaDescription: scrapedArticle.metaDescription,
                    isIndexable: scrapedArticle.isIndexable,
                    headings: JSON.stringify(scrapedArticle.headings),
                    jsonLd: JSON.stringify(scrapedArticle.jsonLd),
                  };
                });

                await updateArticlesToBackend(articlesToUpdate, projectId, token);

                toast({
                  title: "スクレイピング完了",
                  description: `${scrapedArticles.length}件の記事をスクレイピングして更新しました。`,
                });

                // 画面をリフレッシュ
                setTimeout(() => {
                  window.location.reload();
                }, 1000);

              } catch (error) {
                console.error('Failed to save scraped articles:', error);
                toast({
                  title: "保存エラー",
                  description: error instanceof Error ? error.message : "スクレイピング結果の保存に失敗しました。",
                  variant: "destructive",
                });
              }
            }
            
            setCrawlStatus("completed");
          },
          onError: (errorMsg) => {
            setErrorMessage(errorMsg);
            setCrawlStatus("error");
          },
          onStreamEnd: () => {
            setCrawlStatus("completed");
            console.log("Multiple scraping stream ended unexpectedly.");
          },
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Multiple scraping fetch aborted.");
          setCrawlStatus("idle");
          setProgressInfo(null);
        } else {
          console.error("Multiple scraping request failed:", err);
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "複数URLスクレイピングリクエストの送信中にエラーが発生しました"
          );
          setCrawlStatus("error");
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      setGlobalScrapingResults,
      toast,
      setCrawlStatus,
      setProgressInfo,
      setErrorMessage,
      setJobId,
      extractJobId,
    ]
  );

  return {
    startMultipleScraping,
    cancelScraping,
  };
}
