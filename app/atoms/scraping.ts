import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import type { CrawlStatus, ProgressInfo } from "~/types/scraping";

// スクレイピングの状態を管理するatom

// スクレイピング処理の状態 ('idle', 'running', 'completed', 'error')
export const crawlStatusAtom = atomWithReset<CrawlStatus>('idle');

// 進行状況の情報
export const progressInfoAtom = atomWithReset<ProgressInfo | null>(null);

// エラーメッセージ
export const scrapingErrorMessageAtom = atomWithReset<string | null>(null);

// ジョブID
export const scrapingJobIdAtom = atomWithReset<string | null>(null);

// リセット用関数 (必要に応じて使用)
// export const resetScrapingStateAtom = atom(null, (get, set) => {
//   set(crawlStatusAtom, 'idle');
//   set(progressInfoAtom, null);
//   set(scrapingErrorMessageAtom, null);
//   set(scrapingJobIdAtom, null);
// });
