import { useRef, useCallback } from 'react'; // useState を削除
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
// 新しい atom をインポート
import {
  crawlStatusAtom,
  progressInfoAtom,
  scrapingErrorMessageAtom,
  scrapingJobIdAtom
} from '~/atoms/scraping';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { CrawlStatus, ProgressInfo, UseScrapingReturn } from '~/types/scraping';
// APIクライアント関数をインポート
import { startScrapingApi, cancelScrapingApi } from '~/services/scraping.client';
// ストリーム処理ユーティリティをインポート
import { processScrapingStream } from '~/utils/stream-processor.client';

// UseScrapingReturn 型をインポートしないように変更
// import type { UseScrapingReturn } from '~/types/scraping';

// フックの戻り値型を修正 (状態を返さない)
export function useScraping(token?: string): Omit<UseScrapingReturn, 'crawlStatus' | 'progressInfo' | 'errorMessage' | 'jobId'> {
  // Jotai atom を使用
  const [, setCrawlStatus] = useAtom(crawlStatusAtom);
  const [, setProgressInfo] = useAtom(progressInfoAtom);
  const [globalScrapingResults, setGlobalScrapingResults] = useAtom(articlesAtom);
  const [, setErrorMessage] = useAtom(scrapingErrorMessageAtom);
  const [jobId, setJobId] = useAtom(scrapingJobIdAtom); // jobId は読み書き両方必要
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 中断処理関数
  const cancelScraping = useCallback(async (isNavigating = false) => {
    // jobId は atom から取得
    if (!jobId) {
      console.warn("Cannot cancel scraping: Job ID is not set.");
      setCrawlStatus('idle'); // atom を更新
      setJobId(null);      // atom を更新
      setProgressInfo(null); // atom を更新
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
      setJobId(null);      // atom を更新
      setProgressInfo(null); // atom を更新
    }
  }, [jobId, toast, setCrawlStatus, setJobId, setProgressInfo, setGlobalScrapingResults]); // 依存配列に atom の setter を追加

  // フォーム送信時の処理 (fetchとストリーム処理を開始)
  const startScraping = useCallback(async (values: { startUrl: string; targetClass: string }) => {
    // 状態をリセット (atom を使用)
    console.log("Starting scraping, resetting state using atoms...");
    setCrawlStatus('running');
    setProgressInfo(null);
    setErrorMessage(null);
    setJobId(null);
    setGlobalScrapingResults([]); // 記事結果のグローバルステートをリセット
    abortControllerRef.current = new AbortController();

    try {
      // APIクライアント関数を呼び出す
      const response = await startScrapingApi({
        startUrl: values.startUrl,
        targetClass: values.targetClass,
        token,
        // projectId, // projectId を削除
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
      // ストリーム処理ユーティリティを呼び出すためのコールバックを定義
      await processScrapingStream(reader, {
        onStatus: (message) => {
          // setProgressInfo は atom の setter
          setProgressInfo({ message, processedPages: 0, elapsedTime: 0 });
        },
        onProgress: (progress) => {
          // setProgressInfo は atom の setter
          setProgressInfo(progress);
        },
        onData: (article) => {
          // グローバルステートを直接更新
          setGlobalScrapingResults(prev => [...prev, article]);
        },
        onCompletion: (completionInfo) => {
          // setProgressInfo, setCrawlStatus は atom の setter
          setProgressInfo(prev => ({ ...(prev ?? { message: '', processedPages: 0, elapsedTime: 0 }), ...completionInfo }));
          console.log('Scraping completed.');
          setCrawlStatus('completed');
        },
        onError: (errorMsg) => {
          // setErrorMessage, setCrawlStatus は atom の setter
          setErrorMessage(errorMsg);
          setCrawlStatus('error');
        },
        onStreamEnd: () => {
          // crawlStatus は atom から読み取る必要があるが、ここでは setter のみ使用
          // 完了状態にするか、エラー状態にするかは要検討。ここでは完了扱い。
          // Note: このロジックは crawlStatus の現在の値に依存するため、
          // Jotai の get 関数を使うか、別の方法で状態を読む必要があるかもしれない。
          // 一旦、単純に完了にする。
          // if (crawlStatus !== 'error' && crawlStatus !== 'completed') { // このチェックは atom では直接できない
             setCrawlStatus('completed');
          // }
          // 予期せぬ終了の場合 (completion/errorなし)
          // setGlobalScrapingResults(accumulatedArticles); // onDataで更新済み
          console.log('Stream ended unexpectedly.');
        }
      });

    } catch (err) {
       if (err instanceof Error && err.name === 'AbortError') {
        console.log("Fetch aborted.");
        // AbortError の場合は状態を idle に戻すのが自然かもしれない
        setCrawlStatus('idle');
        setProgressInfo(null); // 進行状況もリセット
      } else {
        console.error("Scraping request failed:", err);
        // setErrorMessage, setCrawlStatus は atom の setter
        setErrorMessage(err instanceof Error ? err.message : "スクレイピングリクエストの送信中にエラーが発生しました");
        setCrawlStatus('error');
      }
    } finally {
       abortControllerRef.current = null; // AbortControllerの参照をクリア
    }
  // 依存配列に atom の setter を追加 (projectId を削除)
  }, [token, setGlobalScrapingResults, toast, setCrawlStatus, setProgressInfo, setErrorMessage, setJobId]);

  // フックは状態を直接返さず、アクション関数のみを返す
  return {
    // crawlStatus, // 削除
    // progressInfo, // 削除
    // errorMessage, // 削除
    // jobId, // 削除
    startScraping,
    cancelScraping
  };
}
