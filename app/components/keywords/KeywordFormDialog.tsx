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
} from "~/components/ui/form"; // shadcn/uiのFormコンポーネントをインポート

interface KeywordFormDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  keyword: Keyword | null; // 編集対象のキーワード (nullの場合は新規作成)
  projectId: number; // プロジェクトID (現在は未使用だが将来的に使う可能性あり)
  onSubmit: (data: CreateKeywordFormData | UpdateKeywordFormData, intent: "create" | "update", id?: number) => void; // 型を更新
  // TODO: 親キーワード選択用のデータとコンポーネントが必要
}

export default function KeywordFormDialog({
  isOpen,
  setOpen,
  keyword,
  onSubmit,
}: KeywordFormDialogProps) {
  const isEditing = !!keyword;

  // isEditing に基づいて使用するスキーマを決定
  const currentSchema = useMemo(() => {
    return isEditing ? updateKeywordSchema : createKeywordSchema;
  }, [isEditing]);

  // フォームの型は作成・更新の両方を考慮したユニオン型にする
  const form = useForm<CreateKeywordFormData | UpdateKeywordFormData>({
    resolver: zodResolver(currentSchema), // 動的にスキーマを適用
    // defaultValues は CreateKeywordFormData に合わせておく (Update は optional なので問題ないはず)
    defaultValues: {
      keywordName: "", // Create では必須
      parentId: null, // preprocess で処理されるので null でOK
      level: undefined, // preprocess で処理されるので undefined or 空文字
      searchVolume: undefined, // preprocess で処理されるので undefined or 空文字
      difficulty: null, // preprocess で処理されるので null or 空文字
      relevance: null, // preprocess で処理されるので null or 空文字
      searchIntent: null, // preprocess で処理されるので null or 空文字
      importance: null, // preprocess で処理されるので null or 空文字
      memo: null, // preprocess で処理されるので null or 空文字
    },
  });

  // 編集モードの場合、フォームに初期値を設定
  // keyword の値は数値やnullだが、フォーム入力は文字列になる場合があるので注意
  // preprocess があるため、そのまま渡しても Zod 側で処理されるはず
  useEffect(() => {
    if (isEditing && keyword) {
      form.reset({
        keywordName: keyword.keywordName ?? "",
        parentId: keyword.parentId ?? null,
        level: keyword.level ?? undefined,
        searchVolume: keyword.searchVolume ?? undefined,
        difficulty: keyword.difficulty ?? null,
        relevance: keyword.relevance ?? null,
        searchIntent: keyword.searchIntent ?? null,
        importance: keyword.importance ?? null,
        memo: keyword.memo ?? null,
      });
    } else {
      // 新規作成モードの場合、デフォルト値でリセット
      form.reset({
        keywordName: "",
        parentId: null,
        level: undefined,
        searchVolume: undefined,
        difficulty: null,
        relevance: null,
        searchIntent: null,
        importance: null,
        memo: null,
      });
    }
    // resolver を動的に変更した場合、フォームの状態もリセットする必要があるかもしれない
    // form.trigger(); // 必要に応じてバリデーションを再トリガー
  }, [isEditing, keyword, form]);

  // フォーム送信時の処理
  const handleFormSubmit = (data: CreateKeywordFormData | UpdateKeywordFormData) => { // useForm の型に合わせる
    const intent = isEditing ? "update" : "create";
    // data はスキーマでバリデーション・変換済み
    onSubmit(data, intent, keyword?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "キーワード編集" : "新規キーワード追加"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "キーワード情報を編集します。"
              : "新しいキーワードを登録します。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {/* キーワード名 */}
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

            <div className="grid grid-cols-2 gap-4">
              {/* 検索ボリューム */}
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
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />

              {/* 階層レベル */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>階層レベル</FormLabel>
                    <FormControl>
                      {/* preprocessで処理するため、単純なInputで良い */}
                       <Input
                        type="number"
                        min="1" // HTML5のバリデーションも一応残す
                        placeholder="例: 1"
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
                        onChange={e => field.onChange(e.target.value)} // そのまま文字列を渡す
                      />
                    </FormControl>
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 難易度 */}
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

              {/* 関連度 */}
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

             <div className="grid grid-cols-2 gap-4">
               {/* 検索意図 */}
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

              {/* 重要度 */}
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
                    <FormMessage /> {/* エラーメッセージは Zod から */}
                  </FormItem>
                )}
              />
            </div>

            {/* TODO: 親キーワード選択 (Selectコンポーネントなどを使用) */}
            {/*
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>親キーワード</FormLabel>
                  <FormControl>
                     <Input type="number" placeholder="親キーワードID (任意)" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            {/* メモ */}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
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
