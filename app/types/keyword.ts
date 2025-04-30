/**
 * キーワード情報の型定義
 */
export interface Keyword {
  id: number;
  projectId: number;
  keywordName: string;
  parentId: number | null;
  level: number;
  searchVolume: number;
  difficulty: string | null;
  relevance: string | null;
  searchIntent: string | null;
  importance: string | null;
  memo: string | null;
  createdAt: string; // Date型はJSONシリアライズでstringになるため
  updatedAt: string; // Date型はJSONシリアライズでstringになるため
}

/**
 * キーワード作成時のデータ型 (APIリクエスト用)
 * API仕様書の CreateKeywordDto に対応
 */
export interface CreateKeywordData {
  projectId: number;
  keywordName: string;
  parentId?: number | null;
  level?: number;
  searchVolume?: number;
  difficulty?: string | null;
  relevance?: string | null;
  searchIntent?: string | null;
  importance?: string | null;
  memo?: string | null;
}

/**
 * キーワード更新時のデータ型 (APIリクエスト用)
 * API仕様書の UpdateKeywordDto に対応
 * CreateKeywordData の全てのフィールドがオプショナル
 */
export type UpdateKeywordData = Partial<CreateKeywordData>;
