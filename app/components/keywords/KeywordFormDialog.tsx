import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea"; // Textareaを追加
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { keywordSchema, type KeywordFormData } from "~/share/zod/schemas"; // 古いインポートを削除
import {
  createKeywordSchema,
  updateKeywordSchema,
  type CreateKeywordFormData, // 新しい型をインポート
  type UpdateKeywordFormData, // 新しい型をインポート
} from "~/share/zod/schemas";
import type { Keyword } from "~/types/keyword";
import { useEffect, useMemo } from "react"; // useMemo を追加
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"; // Selectコンポーネントをインポート
import { getKeywordDescendantIds } from "~/utils/keyword-utils"; // 子孫ID取得ユーティリティ関数

/**
 * KeywordFormDialog コンポーネントの Props 定義
 */
interface KeywordFormDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  keyword: Keyword | null;
  projectId: number;
  /** 親キーワード選択肢生成用の全キーワードリストKK*/
  allKeywords: Keyword[];
  /** フォーム送信時のコールバック関数 */
  onSubmit: (data: CreateKeywordFormData | UpdateKeywordFormData, intent: "create" | "update", id?: number) => void;
}

/**
 * キーワードの新規追加または編集を行うためのダイアログコンポーネント。
 * react-hook-form と zod を使用してフォームのバリデーションと状態管理を行います。
 * shadcn/ui の Dialog, Form, Input, Select, Textarea コンポーネントを使用します。
 */
export default function KeywordFormDialog({
  isOpen,
  setOpen,
  keyword,
  allKeywords, // props を受け取る
  onSubmit,
}: KeywordFormDialogProps) {
  // 編集中かどうかのフラグ (keyword prop が存在するかどうかで判定)
  const isEditing = !!keyword;

  // 編集モードか新規作成モードかに基づいて、使用する Zod バリデーションスキーマを動的に選択
  const currentSchema = useMemo(() => {
    return isEditing ? updateKeywordSchema : createKeywordSchema;
  }, [isEditing]);

  // 親キーワード選択肢から除外するIDのセットを計算 (編集中のキーワード自身とそのすべての子孫)
  // これにより、キーワードを自身の親や子孫に設定することを防ぐ
  const excludedIds = useMemo(() => {
    if (isEditing && keyword) {
      return getKeywordDescendantIds(keyword.id, allKeywords);
    }
    return new Set<number>();
  }, [isEditing, keyword, allKeywords]);

  // 親キーワード選択用の <Select> コンポーネントの選択肢を生成
  const parentOptions = useMemo(() => {
    // 最初に「なし (トップレベル)」の選択肢を追加
    const options = [{ value: "null", label: "なし (トップレベル)" }];
    // 全キーワードリストから除外対象を除外し、キーワード名でソート
    allKeywords
      .filter(k => !excludedIds.has(k.id)) // 自分自身と子孫を除外
      .sort((a, b) => a.keywordName.localeCompare(b.keywordName)) // 名前順でソート
      .forEach(k => {
        // 階層を視覚的に示すためのインデント用プレフィックスを生成 (全角スペースと罫線)
        const prefix = k.level && k.level > 1 ? `${'　'.repeat(k.level - 1)}└─ ` : '';
        // 選択肢オブジェクトを作成して追加 (value は string 型)
        options.push({ value: String(k.id), label: `${prefix}${k.keywordName}` });
      });
    return options;
  }, [allKeywords, excludedIds]); // allKeywords または excludedIds が変更された場合に再計算


  // react-hook-form の初期化
  // 型引数には作成・更新の両方のフォームデータを許容するユニオン型を指定
  const form = useForm<CreateKeywordFormData | UpdateKeywordFormData>({
    resolver: zodResolver(currentSchema), // 動的に選択された Zod スキーマを resolver として使用
    // フォームフィールドのデフォルト値
    defaultValues: {
      keywordName: "",
      parentId: null, // デフォルトはトップレベル (null)
      // level はフォームで扱わない
      searchVolume: undefined, // preprocess で undefined になるケースを考慮
      difficulty: null,
      relevance: null,
      searchIntent: null,
      importance: null,
      memo: null,
    },
  });

  // ダイアログが開かれたとき、または編集対象 (keyword) が変更されたときにフォームの値をリセットする
  // isEditing フラグに基づいて、編集モードか新規作成モードかで初期値を設定
  useEffect(() => {
    if (isEditing && keyword) {
      // 編集モード: keyword データから値を取得してフォームをリセット
      // Zod スキーマの preprocess があるため、API からの値をそのまま渡しても基本的にはOK
      form.reset({
        keywordName: keyword.keywordName ?? "",
        parentId: keyword.parentId ?? null, // API からの parentId (number | null) をそのままセット
        // level はフォームにない
        searchVolume: keyword.searchVolume ?? undefined, // API からの値 (number) or デフォルト undefined
        difficulty: keyword.difficulty ?? null,
        relevance: keyword.relevance ?? null,
        searchIntent: keyword.searchIntent ?? null,
        importance: keyword.importance ?? null,
        memo: keyword.memo ?? null,
      });
    } else {
      // 新規作成モード: デフォルト値でフォームをリセット
      form.reset({
        keywordName: "",
        parentId: null, // 新規作成時はデフォルトでトップレベル
        searchVolume: undefined,
        difficulty: null,
        relevance: null,
        searchIntent: null,
        importance: null,
        memo: null,
      });
    }
    // isEditing, keyword, または form インスタンス自体が変更された場合にこの effect を実行
  }, [isEditing, keyword, form]);

  /**
   * フォーム送信時のハンドラ (react-hook-form の handleSubmit から呼び出される)
   * バリデーション成功後、親コンポーネントから渡された onSubmit コールバックを呼び出す。
   * @param data バリデーション済みフォームデータ (CreateKeywordFormData | UpdateKeywordFormData)
   */
  const handleFormSubmit = (data: CreateKeywordFormData | UpdateKeywordFormData) => {
    // 操作の種類 (intent) を決定
    const intent = isEditing ? "update" : "create";
    // 親コンポーネント (KeywordsRoute) の handleFormSubmit を呼び出し、
    // バリデーション・変換済みのデータ、intent、および編集中の場合は keyword ID を渡す
    onSubmit(data, intent, keyword?.id);
  };

  // --- JSX Rendering ---
  return (
    // ダイアログコンポーネント (shadcn/ui)
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        {/* ダイアログヘッダー */}
        <DialogHeader>
          <DialogTitle>{isEditing ? "キーワード編集" : "新規キーワード追加"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "キーワード情報を編集します。"
              : "新しいキーワードを登録します。"}
          </DialogDescription>
        </DialogHeader>
        {/* react-hook-form の Form プロバイダー */}
        <Form {...form}>
          {/* HTML の form 要素。onSubmit に react-hook-form の handleSubmit を接続 */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {/* キーワード名 フィールド (必須) */}
            <FormField
              control={form.control}
              name="keywordName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>キーワード名 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="例: SEO対策" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 検索ボリュームと親キーワード (横並び) */}
            <div className="grid grid-cols-2 gap-4">
              {/* 検索ボリューム フィールド */}
              <FormField
                control={form.control}
                name="searchVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>検索ボリューム</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                      <Input
                        type="number"
                        placeholder="例: 1000"
                        {...field}
                        // value は string | number | readonly string[] | undefined なので調整
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
                        onChange={e => field.onChange(e.target.value)} // そのまま文字列を渡す
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 親キーワード選択 フィールド (Select) */}
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>親キーワード</FormLabel>
                    <Select
                      // Select の value は string である必要がある
                      // field.value (number | null) を適切に string に変換
                      value={field.value === null ? "null" : String(field.value)}
                      onValueChange={(value: string) => { // value の型を string に指定
                        // "null" 文字列が選択されたら null を、それ以外は数値に変換してセット
                        field.onChange(value === "null" ? null : Number(value));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="親キーワードを選択..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 難易度と関連度 (横並び) */}
            <div className="grid grid-cols-2 gap-4">
              {/* 難易度 フィールド */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>難易度</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                      <Input placeholder="例: 中" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />

              {/* 関連度 フィールド */}
              <FormField
                control={form.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>関連度</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                      <Input placeholder="例: 〇" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />
            </div>

            {/* 検索意図と重要度 (横並び) */}
            <div className="grid grid-cols-2 gap-4">
              {/* 検索意図 フィールド */}
              <FormField
                control={form.control}
                name="searchIntent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>検索意図</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                      <Input placeholder="例: Informational" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />

              {/* 重要度 フィールド */}
              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>重要度</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                      <Input placeholder="例: 高" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* メモ フィールド (Textarea) */}
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormControl>
                    {/* preprocessで処理するため、単純なTextareaで良い */}
                    <Textarea placeholder="キーワードに関するメモを入力..." {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage /> {/* エラーメッセージは Zod から */}
                </FormItem>
              )}
            />

            {/* ダイアログフッター: キャンセルボタンと送信ボタン */}
            <DialogFooter>
              {/* キャンセルボタン */}
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              {/* 送信ボタン: isSubmitting 状態に応じて無効化 & ラベル変更 */}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : (isEditing ? "更新" : "作成")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
