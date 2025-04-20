import type { ArticleItem } from "./article";

// スクレイピング処理の状態
export type CrawlStatus = 'idle' | 'running' | 'completed' | 'error';

// 進行状況の情報
export interface ProgressInfo {
  processedPages: number;
  elapsedTime: number;
  message: string;
}

// スクレイピングのレスポンスイベント型
export type ScrapingEvent = 
  | { type: 'status'; message: string }
  | { type: 'progress'; message: string; processed_pages: number; elapsed_time: number }
  | { type: 'completion'; message: string; processed_pages: number; total_time: number }
  | { error: string };

// スクレイピングフックの戻り値の型
export interface UseScrapingReturn {
  crawlStatus: CrawlStatus;
  progressInfo: ProgressInfo | null;
  errorMessage: string | null;
  // scrapedArticles: ArticleItem[]; // 削除: グローバルステートで管理するため
  jobId: string | null;
  startScraping: (values: { startUrl: string; targetClass: string }) => Promise<void>;
  cancelScraping: (isNavigating?: boolean) => Promise<void>;
}
