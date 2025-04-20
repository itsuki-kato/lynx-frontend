import { useState, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { CrawlStatus, ProgressInfo, UseScrapingReturn } from '~/types/scraping';
// APIクライアント関数をインポート
import { startScrapingApi, cancelScrapingApi } from '~/services/scraping.client';
// ストリーム処理ユーティリティをインポート
import { processScrapingStream } from '~/utils/stream-processor.client';

export function useScraping(token?: string): UseScrapingReturn {
  // スクレイピングの状態管理
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>('idle');
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  // scrapedArticles ローカルステートを削除し、代わりに globalScrapingResults を使用
  // const [scrapedArticles, setScrapedArticles] = useState<ArticleItem[]>([]);
  const [globalScrapingResults, setGlobalScrapingResults] = useAtom(articlesAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 状態リセットは startScraping 内で行うため、独立した resetState 関数は不要
  // const resetState = useCallback(() => { ... }, []);

  // 中断処理関数
  const cancelScraping = useCallback(async (isNavigating = false) => {
    if (!jobId) {
      console.warn("Cannot cancel scraping: Job ID is not set.");
      setCrawlStatus('idle');
      setJobId(null);
      setProgressInfo(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        console.log("Fetch aborted by frontend.");
      }
      // 中断時は現在のグローバルステートを保持 (特に更新は不要)
      // setGlobalScrapingResults(globalScrapingResults); // 不要
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log("Fetch aborted by frontend.");
    }

    try {
      // APIクライアント関数を呼び出す
      const stopResponse = await cancelScrapingApi({ jobId });
      const result = await stopResponse.json(); // レスポンスボディは常に読み取る

      if (stopResponse.ok) {
        console.log(`Stop signal sent successfully for job: ${jobId}`);
        if (!isNavigating) {
          toast({
            title: "中断リクエスト送信",
            description: result.message || `スクレイピングジョブ ${jobId} の中断リクエストを送信しました。`,
          });
        }
      } else {
        // APIクライアント側で warn ログは出力済み
        console.error(`Failed to send stop signal for job: ${jobId}`, result);
        if (!isNavigating) {
          toast({
            title: "中断リクエスト失敗",
            description: result.detail || `ジョブ ${jobId} の中断に失敗しました。`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // cancelScrapingApi は通常 fetch レベルのエラーをスローしない想定だが念のため
      console.error(`Error calling cancelScrapingApi for job: ${jobId}`, error);
      if (!isNavigating) {
        toast({
          title: "中断リクエストエラー",
          description: `ジョブ ${jobId} の中断リクエスト送信中に予期せぬエラーが発生しました。`,
          variant: "destructive",
        });
      }
    } finally {
      // 中断時の状態リセットは常に実行
      // setGlobalScrapingResults(globalScrapingResults); // 不要
      setCrawlStatus('idle');
      setJobId(null);
      setProgressInfo(null);
    }
  }, [jobId, toast, setGlobalScrapingResults]); // globalScrapingResults を依存配列から削除

  // フォーム送信時の処理 (fetchとストリーム処理を開始)
  const startScraping = useCallback(async (values: { startUrl: string; targetClass: string }) => {
    // 状態をリセット
    console.log("Starting scraping, resetting state...");
    setCrawlStatus('running');
    setProgressInfo(null);
    // setScrapedArticles([]); // ローカルステート削除
    setErrorMessage(null);
    setJobId(null);
    setGlobalScrapingResults([]); // グローバルステートをリセット
    abortControllerRef.current = new AbortController();

    try {
      // APIクライアント関数を呼び出す
      const response = await startScrapingApi({
        startUrl: values.startUrl,
        targetClass: values.targetClass,
        token,
        signal: abortControllerRef.current.signal,
      });

      // APIクライアントがエラーをスローするので、ここでの !response.ok チェックは不要

      // レスポンスヘッダーから Job ID を取得
      const allHeaders = [...response.headers.entries()];
      console.log("All response headers:", allHeaders);
      
      let foundJobId = null;
      for (const [key, value] of allHeaders) {
        if (key.toLowerCase() === 'x-job-id') {
          foundJobId = value;
          break;
        }
      }
      
      const currentJobId = foundJobId || response.headers.get("x-job-id") || response.headers.get("X-Job-ID");
      
      if (currentJobId) {
        console.log("Received Job ID:", currentJobId);
        setJobId(currentJobId);
        // Job ID 取得ロジックは変更なし
        toast({
          title: "スクレイピング開始",
          description: `ジョブID: ${currentJobId}`,
        });
      } else {
        console.warn("X-Job-ID header not found in response.");
        toast({
          title: "警告",
          description: "ジョブIDが取得できませんでした。中断機能が使用できません。",
          variant: "destructive",
        });
      }

      if (!response.body) {
        throw new Error("レスポンスボディがありません");
      }

      const reader = response.body.getReader();

      // ストリーム処理ユーティリティを呼び出すためのコールバックを定義
      // let accumulatedArticles: ArticleItem[] = []; // グローバルステートを直接更新するため不要
      await processScrapingStream(reader, {
        onStatus: (message) => {
          setProgressInfo({ message, processedPages: 0, elapsedTime: 0 });
        },
        onProgress: (progress) => {
          setProgressInfo(progress);
        },
        onData: (article) => {
          // グローバルステートを直接更新
          setGlobalScrapingResults(prev => [...prev, article]);
        },
        onCompletion: (completionInfo) => {
          setProgressInfo(prev => ({ ...prev, ...completionInfo }));
          // setGlobalScrapingResults(accumulatedArticles); // onDataで更新済み
          console.log('Scraping completed.');
          setCrawlStatus('completed');
        },
        onError: (errorMsg) => {
          setErrorMessage(errorMsg);
          // setGlobalScrapingResults(accumulatedArticles); // エラー時もそれまでの結果を保持 (onDataで更新済み)
          setCrawlStatus('error');
        },
        onStreamEnd: () => {
          // 予期せぬ終了の場合 (completion/errorなし)
          // setGlobalScrapingResults(accumulatedArticles); // onDataで更新済み
          console.log('Stream ended unexpectedly.');
          // 完了状態にするか、エラー状態にするかは要検討。ここでは完了扱い。
          if (crawlStatus !== 'error' && crawlStatus !== 'completed') {
             setCrawlStatus('completed');
          }
        }
      });

    } catch (err) {
       if (err instanceof Error && err.name === 'AbortError') {
        console.log("Fetch aborted.");
      } else {
        console.error("Scraping request failed:", err);
        setErrorMessage(err instanceof Error ? err.message : "スクレイピングリクエストの送信中にエラーが発生しました");
        setCrawlStatus('error');
      }
    } finally {
       abortControllerRef.current = null; // AbortControllerの参照をクリア
    }
  }, [token, setGlobalScrapingResults, toast]); // processStream を依存配列から削除

  return {
    crawlStatus,
    progressInfo,
    errorMessage,
    // scrapedArticles, // 削除
    jobId,
    startScraping,
    cancelScraping
  };
}
