import { z } from "zod";

export const scrapyRequestSchema = z.object({
  startUrl: z.string()
    .min(1, "URLを入力してください")
    .url("有効なURLを入力してください（例: https://example.com）"),
  targetClass: z.string()
    .min(1, "クラス名を入力してください")
    .max(100, "クラス名は100文字以内で入力してください"),
});

export type ScrapyRequest = z.infer<typeof scrapyRequestSchema>;


// --- Keyword Schemas ---

// 共通の preprocess ロジック
const preprocessStringToPositiveNumberOrNull = (val: unknown): number | null => {
  if (val === '' || val === 'null' || val === null || val === undefined || val === 0 || val === '0') {
    return null;
  }
  const num = Number(val);
  return isNaN(num) || num <= 0 ? null : Math.floor(num); // 整数化も考慮
};

const preprocessStringToNumberOrUndefined = (val: unknown): number | undefined => {
  if (val === '' || val === null || val === undefined) {
    return undefined;
  }
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

const preprocessStringToNullableString = (val: unknown): string | null => {
  if (val === '' || val === null || val === undefined) {
    return null;
  }
  return String(val);
};

// Keyword 作成用スキーマ (FormDataからの変換を考慮)
export const createKeywordSchema = z.object({
  keywordName: z.string().min(1, "キーワード名は必須です"),
  parentId: z.preprocess(preprocessStringToPositiveNumberOrNull,
    z.number().int().positive("親IDは正の整数である必要があります").nullable().optional()
  ),
  // level は削除 (サーバーサイドで計算)
  searchVolume: z.preprocess(preprocessStringToNumberOrUndefined,
    z.number().int().min(0, "検索ボリュームは0以上である必要があります").optional()
  ),
  difficulty: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  relevance: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  searchIntent: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  importance: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  memo: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  // projectId は action で付与するため、ここには含めない
});

// Keyword 更新用スキーマ (FormDataからの変換を考慮, 全てオプショナル)
export const updateKeywordSchema = z.object({
  keywordName: z.string().min(1, "キーワード名は必須です").optional(),
  parentId: z.preprocess(preprocessStringToPositiveNumberOrNull,
    z.number().int().positive("親IDは正の整数である必要があります").nullable().optional()
  ),
  // level は削除 (サーバーサイドで計算)
  searchVolume: z.preprocess(preprocessStringToNumberOrUndefined,
    z.number().int().min(0, "検索ボリュームは0以上である必要があります").optional()
  ),
  difficulty: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  relevance: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  searchIntent: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  importance: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  memo: z.preprocess(preprocessStringToNullableString,
    z.string().nullable().optional()
  ),
  // id, projectId は action で別途扱う
});

// フォームデータ用の型定義 (推論させる)
export type CreateKeywordFormData = z.infer<typeof createKeywordSchema>;
export type UpdateKeywordFormData = z.infer<typeof updateKeywordSchema>;
