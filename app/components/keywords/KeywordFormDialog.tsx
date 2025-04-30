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
import { keywordSchema, type KeywordFormData } from "~/share/zod/schemas";
import type { Keyword } from "~/types/keyword";
import { useEffect } from "react";
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
  projectId: number; // プロジェクトID
  onSubmit: (data: KeywordFormData, intent: "create" | "update", id?: number) => void;
  // TODO: 親キーワード選択用のデータとコンポーネントが必要
}

export default function KeywordFormDialog({
  isOpen,
  setOpen,
  keyword,
  projectId,
  onSubmit,
}: KeywordFormDialogProps) {
  const isEditing = !!keyword;
  const form = useForm<KeywordFormData>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      keywordName: "",
      parentId: null,
      level: 1,
      searchVolume: 0,
      difficulty: null,
      relevance: null,
      searchIntent: null,
      importance: null,
      memo: null,
    },
  });

  // 編集モードの場合、フォームに初期値を設定
  useEffect(() => {
    if (isEditing && keyword) {
      form.reset({
        keywordName: keyword.keywordName,
        parentId: keyword.parentId,
        level: keyword.level,
        searchVolume: keyword.searchVolume,
        difficulty: keyword.difficulty,
        relevance: keyword.relevance,
        searchIntent: keyword.searchIntent,
        importance: keyword.importance,
        memo: keyword.memo,
      });
    } else {
      // 新規作成モードの場合、フォームをリセット
      form.reset({
        keywordName: "",
        parentId: null,
        level: 1,
        searchVolume: 0,
        difficulty: null,
        relevance: null,
        searchIntent: null,
        importance: null,
        memo: null,
      });
    }
  }, [isEditing, keyword, form]);

  const handleFormSubmit = (data: KeywordFormData) => {
    const intent = isEditing ? "update" : "create";
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
                      {/* nullを許容しないため、onChangeで数値変換 */}
                      <Input
                        type="number"
                        placeholder="例: 1000"
                        {...field}
                        value={field.value ?? 0} // null/undefined時は0を表示
                        onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
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
                       <Input
                        type="number"
                        min="1"
                        placeholder="例: 1"
                        {...field}
                        value={field.value ?? 1} // null/undefined時は1を表示
                        onChange={e => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="例: 中" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="例: 〇" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="例: Informational" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="例: 高" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
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
                    <Textarea placeholder="キーワードに関するメモを入力..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
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
