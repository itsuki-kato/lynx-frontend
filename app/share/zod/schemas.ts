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

// キーワード作成・更新フォームのバリデーションスキーマ
export const keywordSchema = z.object({
  // id は更新時に必要だが、フォームには含めないことが多いのでここでは定義しない
  // projectId は loader などから取得して action で付与するため、フォームには含めない
  keywordName: z.string().min(1, "キーワード名は必須です"),
  parentId: z.number().int().positive().nullable().optional(), // 親IDは正の整数かnull
  level: z.number().int().min(1, "階層レベルは1以上である必要があります").optional().default(1),
  searchVolume: z.number().int().min(0, "検索ボリュームは0以上である必要があります").optional().default(0),
  difficulty: z.string().nullable().optional(),
  relevance: z.string().nullable().optional(),
  searchIntent: z.string().nullable().optional(),
  importance: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
});

// フォームで使用する型 (id と projectId を除く)
export type KeywordFormData = z.infer<typeof keywordSchema>;
