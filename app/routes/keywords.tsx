import type { Route } from "../+types/root";
import { useLoaderData, useFetcher, Form, useRevalidator } from "react-router"; // useRevalidator を追加
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useState, useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import type { Keyword, CreateKeywordData, UpdateKeywordData } from "~/types/keyword";
import { keywordSchema, type KeywordFormData } from "~/share/zod/schemas"; // KeywordFormData をインポート
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import KeywordTable from "~/components/keywords/KeywordTable"; // インポート
import KeywordFormDialog from "~/components/keywords/KeywordFormDialog"; // インポート
import { X } from "lucide-react"; // クリアボタン用アイコン

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "キーワード管理 | LYNX" },
    { name: "description", content: "登録されたキーワードの管理" },
  ];
}

// --- Loader ---
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");
  const projectId = 1; // TODO: プロジェクト選択機能実装後に動的にする

  try {
    // GET /keywords API を呼び出し (projectId=1 は固定)
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords?projectId=${projectId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      let errorBody = "不明なAPIエラー";
      try { errorBody = await response.text(); } catch { /* ignore */ }
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const keywords: Keyword[] = await response.json();
    // createdAt と updatedAt を Date オブジェクトに変換 (必要であれば)
    // const keywordsWithDate = keywords.map(k => ({
    //   ...k,
    //   createdAt: new Date(k.createdAt),
    //   updatedAt: new Date(k.updatedAt),
    // }));
    // return { keywords: keywordsWithDate, user, projectId, error: null };
    return { keywords, user, projectId, error: null }; // そのまま返す
  } catch (error) {
    console.error("API fetch error:", error);
    return {
      keywords: [],
      user,
      projectId,
      error: error instanceof Error ? error.message : "キーワードデータの取得に失敗しました",
    };
  }
};

// --- Action ---
export const action = async ({ request }: Route.ActionArgs) => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const projectId = Number(formData.get("projectId") || 1);

  try {
    switch (intent) {
      case "create": {
        const dataForValidation = {
          keywordName: formData.get("keywordName") as string ?? "",
          parentId: formData.get("parentId") ? Number(formData.get("parentId")) : null,
          level: formData.get("level") ? Number(formData.get("level")) : undefined,
          searchVolume: formData.get("searchVolume") ? Number(formData.get("searchVolume")) : undefined,
          difficulty: formData.get("difficulty") as string || null,
          relevance: formData.get("relevance") as string || null,
          searchIntent: formData.get("searchIntent") as string || null,
          importance: formData.get("importance") as string || null,
          memo: formData.get("memo") as string || null,
        };
        if (dataForValidation.parentId === 0) dataForValidation.parentId = null;

        const validationResult = keywordSchema.safeParse(dataForValidation);
        if (!validationResult.success) {
          console.error("Validation errors (create):", validationResult.error.flatten().fieldErrors);
          return { ok: false, error: "入力内容が無効です。", errors: validationResult.error.flatten().fieldErrors };
        }

        const dataToCreate: CreateKeywordData = { ...validationResult.data, projectId };
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords`, {
          method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(dataToCreate),
        });
        if (!response.ok) { let e = "作成エラー"; try { e = await response.text(); } catch { } throw new Error(`API error (${response.status}): ${e}`); }
        return { ok: true, message: "キーワードを作成しました。" };
      }
      case "update": {
        const keywordId = formData.get("id") as string;
        if (!keywordId) return { ok: false, error: "キーワードIDが必要です。" };
        const dataForValidation: Record<string, any> = {};
        if (formData.has("keywordName")) dataForValidation.keywordName = formData.get("keywordName") as string;
        if (formData.has("parentId")) { const v = formData.get("parentId"); dataForValidation.parentId = v && v !== 'null' ? Number(v) : null; if (dataForValidation.parentId === 0) dataForValidation.parentId = null; }
        if (formData.has("level")) dataForValidation.level = Number(formData.get("level"));
        if (formData.has("searchVolume")) dataForValidation.searchVolume = Number(formData.get("searchVolume"));
        if (formData.has("difficulty")) dataForValidation.difficulty = formData.get("difficulty") as string || null;
        if (formData.has("relevance")) dataForValidation.relevance = formData.get("relevance") as string || null;
        if (formData.has("searchIntent")) dataForValidation.searchIntent = formData.get("searchIntent") as string || null;
        if (formData.has("importance")) dataForValidation.importance = formData.get("importance") as string || null;
        if (formData.has("memo")) dataForValidation.memo = formData.get("memo") as string || null;

        const validationResult = keywordSchema.partial().safeParse(dataForValidation);
        if (!validationResult.success) {
          console.error("Validation errors (update):", validationResult.error.flatten().fieldErrors);
          return { ok: false, error: "入力内容が無効です。", errors: validationResult.error.flatten().fieldErrors };
        }
        const dataToUpdate: UpdateKeywordData = validationResult.data;
        if (Object.keys(dataToUpdate).length === 0) return { ok: true, message: "更新する内容がありません。" };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords/${keywordId}`, {
          method: "PATCH", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(dataToUpdate),
        });
        if (!response.ok) { let e = "更新エラー"; try { e = await response.text(); } catch { } throw new Error(`API error (${response.status}): ${e}`); }
        return { ok: true, message: "キーワードを更新しました。" };
      }
      case "delete": {
        const keywordId = formData.get("id") as string;
        if (!keywordId) return { ok: false, error: "キーワードIDが必要です。" };
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords/${keywordId}`, {
          method: "DELETE", headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) { let e = "削除エラー"; try { e = await response.text(); } catch { } throw new Error(`API error (${response.status}): ${e}`); }
        return { ok: true, message: "キーワードを削除しました。" };
      }
      default: return { ok: false, error: "不明な操作です。" };
    }
  } catch (error) {
    console.error("Action error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "操作に失敗しました" };
  }
};

// --- Component ---
export default function KeywordsRoute() {
  const { keywords, user, projectId, error: loaderError } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false); // 状態管理を追加
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null); // 状態管理を追加
  const revalidator = useRevalidator(); // 再検証用フックを追加

  // Loader エラー表示
  useEffect(() => {
    if (loaderError) {
      toast({ title: "データ読み込みエラー", description: loaderError, variant: "destructive" });
    }
  }, [loaderError, toast]);

  // Action 結果表示 (fetcher経由)
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data.ok) {
        toast({ title: "成功", description: fetcher.data.message });
        setIsFormOpen(false); // フォームを閉じる
        setEditingKeyword(null); // 編集状態をリセット
        revalidator.revalidate(); // loaderを再実行して一覧を更新
      } else {
        toast({ title: "エラー", description: fetcher.data.error || "操作に失敗しました", variant: "destructive" });
      }
    }
  }, [fetcher.data, fetcher.state, toast, revalidator]);

  // 検索フィルター
  const filteredKeywords = keywords.filter((keyword: Keyword) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      keyword.keywordName?.toLowerCase().includes(searchLower) ||
      keyword.memo?.toLowerCase().includes(searchLower)
    );
  });

  // 新規追加ボタンのハンドラ
  const handleAddNew = () => {
    setEditingKeyword(null);
    setIsFormOpen(true);
  };

  // 編集ボタンのハンドラ
  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setIsFormOpen(true);
  };

  // 削除ボタンのハンドラ
  const handleDelete = (keywordId: number) => {
    if (window.confirm(`ID: ${keywordId} のキーワードを本当に削除しますか？`)) {
      fetcher.submit({ intent: "delete", id: String(keywordId), projectId: String(projectId) }, { method: "post" });
    }
  };

  // フォーム送信ハンドラ
  const handleFormSubmit = (data: KeywordFormData, intent: "create" | "update", id?: number) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("projectId", String(projectId));
    if (id) formData.append("id", String(id));

    // KeywordFormData の各キーに対してループ
    Object.entries(data).forEach(([key, value]) => {
      // null や undefined でない場合のみ FormData に追加
      // Zod スキーマで型が保証されている前提
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      } else if (key === 'parentId' && value === null) {
        // parentId が null の場合は空文字として送信する (API仕様に依存する可能性あり)
        // または、送信しないという選択肢もある
        formData.append(key, ''); // または何もしない
      }
    });
    fetcher.submit(formData, { method: "post" });
  };


  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">キーワード管理</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              登録された {keywords.length} 件のキーワードを表示します
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            {/* 検索ボックス */}
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="キーワード名、メモで検索..."
                className="w-full pr-8" // クリアボタン分のパディング
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {/* 新規追加ボタン */}
            <Button
              onClick={handleAddNew} // ハンドラを有効化
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              新規キーワード追加
            </Button>
          </div>
        </div>

        {/* 検索結果カウント */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            検索結果: {filteredKeywords.length} 件
          </div>
        )}

        {/* キーワード一覧テーブル */}
        <div className="mt-8"> {/* Removed border and overflow-hidden from here */}
          <KeywordTable
            keywords={filteredKeywords}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* キーワード追加/編集フォームモーダル */}
        <KeywordFormDialog
          isOpen={isFormOpen}
          setOpen={setIsFormOpen}
          keyword={editingKeyword}
          projectId={projectId}
          onSubmit={handleFormSubmit} // フォーム送信ハンドラを渡す
        />
      </div>
    </div>
  );
}
