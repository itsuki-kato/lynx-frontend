// アプリケーション全体で使用する定数を定義します。

/**
 * APIのベースURL。
 * 環境変数 `VITE_API_BASE_URL` から取得します。
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * プロジェクト作成APIのエンドポイント。
 */
export const PROJECTS_API_ENDPOINT = `${API_BASE_URL}/projects`;
