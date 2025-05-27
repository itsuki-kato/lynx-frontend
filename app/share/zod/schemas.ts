import { z } from "zod";

/**
 * スクレイピングリクエストのバリデーションスキーマ
 */
export const scrapyRequestSchema = z.object({
  startUrl: z
    .string()
    .min(1, "URLを入力してください")
    .url("有効なURLを入力してください（例: https://example.com）"),
  targetClass: z
    .string()
    .min(1, "クラス名を入力してください")
    .max(100, "クラス名は100文字以内で入力してください"),
});

export type ScrapyRequest = z.infer<typeof scrapyRequestSchema>;

// --- Keyword Schemas ---

// --- Preprocess Functions for Form Data ---
// フォームからの入力 (主に文字列) をAPIが期待する型に変換するためのヘルパー関数群

/**
 * 文字列を正の整数またはnullに変換するpreprocess関数。
 * 空文字、'null'、null、undefined、0、'0' は null に変換。
 * それ以外の数値文字列は正の整数に変換し、無効な場合は null を返す。
 * @param val 入力値 (unknown)
 * @returns number | null
 */
const preprocessStringToPositiveNumberOrNull = (
  val: unknown
): number | null => {
  if (
    val === "" ||
    val === "null" ||
    val === null ||
    val === undefined ||
    val === 0 ||
    val === "0"
  ) {
    return null;
  }
  const num = Number(val);
  return isNaN(num) || num <= 0 ? null : Math.floor(num); // 整数化
};

/**
 * 文字列を数値またはundefinedに変換するpreprocess関数。
 * 空文字、null、undefined は undefined に変換。
 * それ以外の数値文字列は数値に変換し、無効な場合は undefined を返す。
 * API側で undefined の場合にデフォルト値が適用されることを期待するフィールドに使用。
 * @param val 入力値 (unknown)
 * @returns number | undefined
 */
const preprocessStringToNumberOrUndefined = (
  val: unknown
): number | undefined => {
  if (val === "" || val === null || val === undefined) {
    return undefined;
  }
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

/**
 * 文字列をnull許容文字列に変換するpreprocess関数。
 * 空文字、null、undefined は null に変換。
 * それ以外は文字列に変換。
 * @param val 入力値 (unknown)
 * @returns string | null
 */
const preprocessStringToNullableString = (val: unknown): string | null => {
  if (val === "" || val === null || val === undefined) {
    return null;
  }
  return String(val);
};

// --- Zod Schemas for Keywords ---

/**
 * キーワード作成用 Zod スキーマ (API: POST /keywords)
 * FormData からの変換を考慮し、preprocess を使用。
 * API仕様書の CreateKeywordDto に対応。
 */
export const createKeywordSchema = z.object({
  /** キーワード名 (必須) */
  keywordName: z.string().min(1, "キーワード名は必須です"),
  /** 親キーワードID (任意、null許容、正の整数) */
  parentId: z.preprocess(
    preprocessStringToPositiveNumberOrNull,
    z
      .number()
      .int()
      .positive("親IDは正の整数である必要があります")
      .nullable()
      .optional() // API仕様では number | null
  ),
  // level はフロントエンドでは扱わず、サーバーサイドで計算・設定される想定
  /** 検索ボリューム (任意、0以上の整数) */
  searchVolume: z.preprocess(
    preprocessStringToNumberOrUndefined,
    z
      .number()
      .int()
      .min(0, "検索ボリュームは0以上である必要があります")
      .optional() // API仕様では default: 0
  ),
  /** 競合性・難易度 (任意、null許容文字列) */
  difficulty: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** メディア目的適合度 (任意、null許容文字列) */
  relevance: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** KWの検索意図 (任意、null許容文字列) */
  searchIntent: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** KWの重要度 (任意、null許容文字列) */
  importance: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** メモ欄 (任意、null許容文字列) */
  memo: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  // projectId は action 関数内で付与するため、このスキーマには含めない
});

/**
 * キーワード更新用 Zod スキーマ (API: PATCH /keywords/:id)
 * FormData からの変換を考慮し、preprocess を使用。
 * 全てのフィールドがオプショナル。
 * API仕様書の UpdateKeywordDto に対応。
 */
export const updateKeywordSchema = z.object({
  /** キーワード名 (任意) */
  keywordName: z.string().min(1, "キーワード名は必須です").optional(),
  /** 親キーワードID (任意、null許容、正の整数) */
  parentId: z.preprocess(
    preprocessStringToPositiveNumberOrNull,
    z
      .number()
      .int()
      .positive("親IDは正の整数である必要があります")
      .nullable()
      .optional() // API仕様では number | null
  ),
  // level はフロントエンドでは扱わず、サーバーサイドで計算・設定される想定
  /** 検索ボリューム (任意、0以上の整数) */
  searchVolume: z.preprocess(
    preprocessStringToNumberOrUndefined,
    z
      .number()
      .int()
      .min(0, "検索ボリュームは0以上である必要があります")
      .optional() // API仕様では default: 0
  ),
  /** 競合性・難易度 (任意、null許容文字列) */
  difficulty: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** メディア目的適合度 (任意、null許容文字列) */
  relevance: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** KWの検索意図 (任意、null許容文字列) */
  searchIntent: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** KWの重要度 (任意、null許容文字列) */
  importance: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  /** メモ欄 (任意、null許容文字列) */
  memo: z.preprocess(
    preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  // id (パスパラメータ) および projectId は action 関数内で別途扱われる
});

// --- TypeScript Types inferred from Zod Schemas ---

/** キーワード作成フォームのデータ型 (Zod スキーマから推論) */
export type CreateKeywordFormData = z.infer<typeof createKeywordSchema>;
/** キーワード更新フォームのデータ型 (Zod スキーマから推論) */
export type UpdateKeywordFormData = z.infer<typeof updateKeywordSchema>;

// --- Project Schemas ---

/**
 * プロジェクト作成・更新用 Zod スキーマ
 * API仕様書の CreateProjectDto に対応。
 */
export const projectSchema = z.object({
  projectName: z.string().min(1, { message: 'プロジェクト名は必須です。' }),
  projectUrl: z.string().url({ message: '有効なURLを入力してください。' }),
  description: z.string().optional(),
});

/** プロジェクトフォームのデータ型 (Zod スキーマから推論) */
export type ProjectFormData = z.infer<typeof projectSchema>;
