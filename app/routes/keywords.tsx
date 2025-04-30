import type { Route } from "../+types/root";
import { useLoaderData, useFetcher, Form, useRevalidator } from "react-router"; // useRevalidator を追加
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useState, useEffect, useRef } from "react"; // useRef をインポート
import { useToast } from "~/hooks/use-toast";
import type { Keyword, CreateKeywordData, UpdateKeywordData } from "~/types/keyword";
import {
  createKeywordSchema,
  updateKeywordSchema,
  type CreateKeywordFormData, // 新しい型をインポート
  type UpdateKeywordFormData, // 新しい型をインポート
} from "~/share/zod/schemas";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import KeywordTable from "~/components/keywords/KeywordTable";
import KeywordFormDialog from "~/components/keywords/KeywordFormDialog";
import { X } from "lucide-react";

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

// --- Action Helpers ---

// validateKeywordData 関数は不要になったため削除

/**
 * API 呼び出しを抽象化するヘルパー関数
 * @param path API エンドポイントのパス (例: "/keywords")
 * @param method HTTP メソッド (例: "POST", "PATCH", "DELETE")
 * @param token 認証トークン
 * @param body リクエストボディ (JSON 化される)
 * @returns API 呼び出し結果 { ok: boolean, data?: any, error?: string }
 */
const callApi = async (path: string, method: string, token: string, body?: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorBody = `${method} ${path} failed`;
      try {
        errorBody = await response.text();
      } catch { /* ignore */ }
      console.error(`API error (${response.status}) on ${method} ${path}:`, errorBody);
      return { ok: false, error: `APIエラー (${response.status}): ${errorBody}` };
    }
    // DELETE など、ボディがない成功レスポンスの場合もある
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { ok: true, data: null }; // ボディなし成功
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error(`Network or other error on ${method} ${path}:`, error);
    return { ok: false, error: error instanceof Error ? error.message : "ネットワークエラーまたは不明なエラー" };
  }
};

// --- Action Handlers ---

/** キーワード作成処理 */
const handleCreateKeyword = async (formData: FormData, token: string, projectId: number) => {
  // FormData をプレーンオブジェクトに変換
  const rawData = Object.fromEntries(formData.entries());
  // createKeywordSchema で直接バリデーション
  const validation = createKeywordSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Validation errors (create):", validation.error.flatten().fieldErrors);
    return { ok: false, error: "入力内容が無効です。", errors: validation.error.flatten().fieldErrors };
  }

  // バリデーション済みデータに projectId を追加
  // バリデーション済みデータに projectId を追加
  const dataToCreate: CreateKeywordData = { ...validation.data, projectId };

  // level の計算ロジックは削除 (API側で処理される想定)

  const apiResult = await callApi("/keywords", "POST", token, dataToCreate);

  if (!apiResult.ok) {
    return { ok: false, error: apiResult.error || "キーワードの作成に失敗しました。" };
  }
  return { ok: true, message: "キーワードを作成しました。" };
};

/** キーワード更新処理 */
const handleUpdateKeyword = async (formData: FormData, token: string) => {
  const keywordId = formData.get("id") as string;
  if (!keywordId) {
    return { ok: false, error: "キーワードIDが必要です。" };
  }

  // FormData をプレーンオブジェクトに変換
  const rawData = Object.fromEntries(formData.entries());
  // updateKeywordSchema で直接バリデーション
  const validation = updateKeywordSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Validation errors (update):", validation.error.flatten().fieldErrors);
    return { ok: false, error: "入力内容が無効です。", errors: validation.error.flatten().fieldErrors };
  }

  const dataToUpdate: UpdateKeywordData = validation.data;

  // level の計算ロジックは削除 (API側で処理される想定)
  // parentId が更新された場合、API側で level も更新されることを期待する

  // 更新するデータがない場合は成功として扱う（API負荷軽減）
  // スキーマが optional なので、空オブジェクトはバリデーションを通過する
  if (Object.keys(dataToUpdate).length === 0) {
    return { ok: true, message: "更新する内容がありません。" };
  }

  const apiResult = await callApi(`/keywords/${keywordId}`, "PATCH", token, dataToUpdate);

  if (!apiResult.ok) {
    return { ok: false, error: apiResult.error || "キーワードの更新に失敗しました。" };
  }
  return { ok: true, message: "キーワードを更新しました。" };
};

/** キーワード削除処理 */
const handleDeleteKeyword = async (formData: FormData, token: string) => {
  const keywordId = formData.get("id") as string;
  if (!keywordId) {
    return { ok: false, error: "キーワードIDが必要です。" };
  }

  const apiResult = await callApi(`/keywords/${keywordId}`, "DELETE", token);

  if (!apiResult.ok) {
    return { ok: false, error: apiResult.error || "キーワードの削除に失敗しました。" };
  }
  return { ok: true, message: "キーワードを削除しました。" };
};


// --- Action ---
export const action = async ({ request }: Route.ActionArgs) => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const projectId = Number(formData.get("projectId") || 1); // projectId を取得

  try {
    switch (intent) {
      case "create":
        return await handleCreateKeyword(formData, token, projectId); // projectId を渡す
      case "update":
        return await handleUpdateKeyword(formData, token);
      case "delete":
        return await handleDeleteKeyword(formData, token);
      default:
        return { ok: false, error: "不明な操作です。" };
    }
  } catch (error) {
    console.error("Action error:", error);
    // ハンドラ内で捕捉されなかった予期せぬエラー
    return { ok: false, error: error instanceof Error ? error.message : "予期せぬエラーが発生しました" };
  }
};


// --- Component ---
export default function KeywordsRoute() {
  const { keywords, user, projectId, error: loaderError } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const revalidator = useRevalidator();
  const prevFetcherStateRef = useRef<typeof fetcher.state | undefined>(undefined); // 初期値 undefined を設定し、型に | undefined を追加

  // Loader エラー表示
  useEffect(() => {
    if (loaderError) {
      toast({ title: "データ読み込みエラー", description: loaderError, variant: "destructive" });
    }
  }, [loaderError, toast]);

  // Action 結果表示 (fetcher経由) - 修正版: loading -> idle の遷移を検知
  useEffect(() => {
    // state が 'loading' から 'idle' に変化し、かつ data が存在する場合のみ処理
    if (prevFetcherStateRef.current === "loading" && fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.ok) {
        toast({ title: "成功", description: fetcher.data.message });
        setIsFormOpen(false); // フォームを閉じる
        setEditingKeyword(null); // 編集状態をリセット
        revalidator.revalidate(); // loaderを再実行して一覧を更新 (空のオプションを渡す)
      } else {
        toast({ title: "エラー", description: fetcher.data.error || "操作に失敗しました", variant: "destructive" });
      }
    }
    // 現在の state を ref に保存
    prevFetcherStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, toast, revalidator, setIsFormOpen, setEditingKeyword]);

  // 検索フィルター (フラットなリストに対して実行)
  const flatFilteredKeywords = keywords.filter((keyword: Keyword) => {
    if (!searchTerm) return true; // 検索語がない場合はすべて表示
    const searchLower = searchTerm.toLowerCase();
    // キーワード名またはメモに検索語が含まれるかチェック
    return (
      keyword.keywordName?.toLowerCase().includes(searchLower) ||
      keyword.memo?.toLowerCase().includes(searchLower)
    );
  });

  // buildKeywordTree は不要になったため、フィルタリングされたフラットなリストをそのまま使用
  // 注意: 検索で親が除外されると子も表示されなくなる点は KeywordTable 側で考慮される想定
  const filteredKeywords = flatFilteredKeywords;


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

  // フォーム送信ハンドラ (KeywordFormDialog から呼び出される)
  // data の型を CreateKeywordFormData | UpdateKeywordFormData に変更する必要があるが、
  // KeywordFormDialog 側の修正も必要になるため、一旦 any で受けるか、
  // Dialog 側で intent に応じて型を確定させる。
  // ここでは一旦、呼び出し側の修正を前提として型を調整する。
  const handleFormSubmit = (data: CreateKeywordFormData | UpdateKeywordFormData, intent: "create" | "update", id?: number) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("projectId", String(projectId));
    if (id) formData.append("id", String(id));

    // スキーマでバリデーション済みのデータを FormData に詰める
    // preprocess で変換されているため、そのまま String() で変換してよいはず
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // boolean 型など他の型も考慮する場合は、より丁寧な変換が必要かもしれないが、
        // 今回のスキーマでは string, number, null, undefined のみのはず
        formData.append(key, String(value));
      } else if (value === null) {
        // null の場合は空文字として送信するか、送信しないか選択
        // preprocess で null に変換されているので、ここでは空文字にする
        formData.append(key, '');
      }
      // undefined の場合は何もしない (FormData に追加されない)
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

        {/* 検索結果カウント (フィルタリング後のフラットな件数を表示) */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            検索結果: {flatFilteredKeywords.length} 件 (フィルタリングされたキーワード数)
          </div>
        )}

        {/* キーワード一覧テーブル (フィルタリングされたデータを渡す) */}
        <div className="mt-8">
          <KeywordTable
            keywords={filteredKeywords} // フィルタリングされたデータを渡す
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
          allKeywords={keywords} // 全キーワードリストを渡す
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
}
