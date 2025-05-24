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

// startScraping 関数の引数の型
export interface StartScrapingParams {
  startUrl: string;
  targetClass: string;
  // projectId: number; // projectId を削除
}

// スクレイピングフックの戻り値の型 (状態は含まない)
export interface UseScrapingReturn {
  startScraping: (values: StartScrapingParams) => Promise<void>;
  cancelScraping: (isNavigating?: boolean) => Promise<void>;
}
