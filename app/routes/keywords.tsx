import type { Route } from "../+types/root";
import { useLoaderData, useFetcher, Form, useRevalidator, useMatches } from "react-router"; // useRevalidator, useMatches を追加
import { getSession } from "~/utils/session.server";
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import type { UserProfile } from "~/types/user"; // UserProfile をインポート
import { useState, useEffect, useRef, useCallback } from "react"; // useRef, useCallback をインポート
import { useToast } from "~/hooks/use-toast";
import type { Keyword, CreateKeywordData, UpdateKeywordData } from "~/types/keyword";
import {
  createKeywordSchema,
  updateKeywordSchema,
  type CreateKeywordFormData,
  type UpdateKeywordFormData,
} from "~/share/zod/schemas";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import KeywordTreeTable from "~/components/keywords/KeywordTreeTable"; // 新しいツリーテーブルをインポート
import KeywordFormDialog from "~/components/keywords/KeywordFormDialog";
import KeywordDetailSidebar from "~/components/keywords/KeywordDetailSidebar"; // 詳細サイドバーをインポート
import { X } from "lucide-react";

/**
 * Remix の meta 関数: ページのメタ情報を定義します。
 */
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "キーワード管理 | LYNX" },
    { name: "description", content: "登録されたキーワードの管理" },
  ];
}

// --- Loader ---
/**
 * Remix の loader 関数: サーバーサイドでキーワード一覧データを取得します。
 * API仕様書: GET /keywords
 * @param request Remix の LoaderArgs オブジェクト
 * @returns キーワード一覧、ユーザー情報、プロジェクトID、エラー情報を含むオブジェクト
 */
import { getSelectedProjectId } from "~/utils/session.server"; // getSelectedProjectId をインポート
import { redirect } from "react-router"; // redirect をインポート

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = await getSelectedProjectId(request);

  if (!token) {
    console.error("No token found in keywords loader, should have been redirected by root.");
    // トークンがない場合は loader の責務ではないので root に任せる想定だが、念のためログインへ
    return redirect("/login"); 
  }

  if (!selectedProjectIdString) {
    console.error("No project selected in keywords loader.");
    // プロジェクトが選択されていない場合、プロジェクト作成ページか選択を促すページへ
    // ここではプロジェクト未選択エラーを返すか、/projects/new へリダイレクト
    // return { keywords: [], flatKeywordsForSelect: [], projectId: null, error: "プロジェクトが選択されていません。" };
    return redirect("/projects/new"); // プロジェクト作成を促す
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    console.error("Invalid projectId in session for keywords loader.");
    return redirect("/projects/new"); // 不正なIDの場合も作成を促す
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords/project/${projectId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      let errorBody = "不明なAPIエラー";
      try { errorBody = await response.text(); } catch { /* ignore */ }
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const keywordsFromApi: Keyword[] = await response.json();

    // --- 追加: キーワードデータをフラット化し、正しいレベルを計算する ---
    const flattenKeywordsWithLevel = (keywords: Keyword[], level = 1): Keyword[] => {
      let flatList: Keyword[] = [];
      for (const keyword of keywords) {
        // 現在のキーワードを正しいレベルで追加 (子キーワード情報は削除)
        const { childKeywords, ...keywordWithoutChildren } = keyword;
        flatList.push({ ...keywordWithoutChildren, level });
        // 子キーワードが存在すれば、再帰的に処理して結果を結合
        if (childKeywords && childKeywords.length > 0) {
          flatList = flatList.concat(flattenKeywordsWithLevel(childKeywords, level + 1));
        }
      }
      return flatList;
    };
    const flatKeywordsForSelect = flattenKeywordsWithLevel(keywordsFromApi);
    // --- ここまで ---

    // loader の戻り値に、元の階層データとフラット化されたデータを両方含める
    return {
      keywords: keywordsFromApi, // テーブル表示用の階層データ
      flatKeywordsForSelect, // ダイアログ選択肢用のフラットデータ
      // user, // 返さない
      projectId,
      error: null
    };
  } catch (error) {
    console.error("API fetch error:", error);
    // エラーが発生した場合でも、ページ描画に必要な最低限の情報を返す
    return {
      keywords: [],
      flatKeywordsForSelect: [],
      projectId, // 数値型になった projectId を返す
      error: error instanceof Error ? error.message : "キーワードデータの取得に失敗しました",
    };
  }
};

// --- Action Helpers ---

/**
 * API 呼び出しを抽象化する汎用ヘルパー関数。
 * fetch を使用し、認証ヘッダーや Content-Type を設定します。
 * エラーハンドリングも行い、結果を { ok: boolean, data?: any, error?: string } の形式で返します。
 * @param path API エンドポイントのパス (例: "/keywords")
 * @param method HTTP メソッド (例: "POST", "PATCH", "DELETE")
 * @param token 認証用 Bearer トークン
 * @param body リクエストボディ (JSON.stringify される)
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
// Remix の action 関数内で呼び出される、各操作に対応するハンドラ関数群

/**
 * キーワード作成処理 (intent="create")
 * FormData を受け取り、Zod スキーマでバリデーション後、POST /keywords API を呼び出します。
 * @param formData フォームデータ
 * @param token 認証トークン
 * @param projectId プロジェクトID
 * @returns 処理結果 { ok: boolean, message?: string, error?: string, errors?: Zod Field Errors }
 */
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

/**
 * キーワード更新処理 (intent="update")
 * FormData を受け取り、Zod スキーマでバリデーション後、PATCH /keywords/:id API を呼び出します。
 * @param formData フォームデータ (id を含む)
 * @param token 認証トークン
 * @returns 処理結果 { ok: boolean, message?: string, error?: string, errors?: Zod Field Errors }
 */
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

/**
 * キーワード削除処理 (intent="delete")
 * FormData から ID を取得し、DELETE /keywords/:id API を呼び出します。
 * @param formData フォームデータ (id を含む)
 * @param token 認証トークン
 * @returns 処理結果 { ok: boolean, message?: string, error?: string }
 */
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
/**
 * Remix の action 関数: フォームからの POST リクエストを処理します。
 * FormData の "intent" パラメータに基づき、対応するハンドラ関数 (作成/更新/削除) を呼び出します。
 * @param request Remix の ActionArgs オブジェクト
 * @returns 各ハンドラ関数からのレスポンス (JSON)
 */
export const action = async ({ request }: Route.ActionArgs) => {
  // await requireAuth(request); // root loader で実施
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    // このケースは基本的には発生しないはずだが、念のため
    console.error("No token found in keywords action, should have been redirected by root.");
    return { ok: false, error: "認証トークンが見つかりません。" };
  }
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  // action でもセッションから projectId を取得する
  const selectedProjectIdStringFromAction = await getSelectedProjectId(request); 

  if (!selectedProjectIdStringFromAction) {
    return { ok: false, error: "プロジェクトが選択されていません。ページをリロードしてください。" };
  }
  const projectIdFromSession = parseInt(selectedProjectIdStringFromAction, 10);
  if (isNaN(projectIdFromSession)) {
    return { ok: false, error: "不正なプロジェクトIDです。ページをリロードしてください。" };
  }
  
  // フォームからも projectId を取得し、セッションの値と一致するか確認する（より安全）
  // ただし、KeywordFormDialog が projectId を hidden input などで送信する必要がある
  // 今回はセッションの値を優先する
  const formProjectId = formData.get("projectId") ? Number(formData.get("projectId")) : null;
  if (formProjectId !== null && formProjectId !== projectIdFromSession) {
      console.warn(`Project ID mismatch in keywords action: session=${projectIdFromSession}, form=${formProjectId}. Using session ID.`);
  }


  try {
    switch (intent) {
      case "create":
        // handleCreateKeyword にはセッションから取得した projectIdFromSession を渡す
        return await handleCreateKeyword(formData, token, projectIdFromSession);
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
/**
 * キーワード管理ページのメインコンポーネント。
 * loader からデータを取得し、キーワード一覧表示 (KeywordTable)、
 * 検索フィルター、新規追加/編集/削除機能を提供します。
 * KeywordFormDialog をモーダルとして表示・制御します。
 */
export default function KeywordsRoute() {
  // loader から階層データとフラットデータの両方を取得
  const { keywords, flatKeywordsForSelect, projectId, error: loaderError } = useLoaderData<typeof loader>(); // user を削除
  const matches = useMatches();
  const rootData = matches.find(match => match.id === 'root')?.data as { userProfile?: UserProfile } | undefined;
  const userProfile = rootData?.userProfile; // 必要であれば利用

  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false); // 詳細サイドバーの開閉状態
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null); // 詳細表示するキーワード
  const revalidator = useRevalidator();
  const prevFetcherStateRef = useRef<typeof fetcher.state | undefined>(undefined); // fetcher の前回の状態を保持する ref

  // Loader エラー表示 (初回読み込み時)
  useEffect(() => {
    if (loaderError) {
      toast({ title: "データ読み込みエラー", description: loaderError, variant: "destructive" });
    }
  }, [loaderError, toast]);

  // Action (作成/更新/削除) の結果を fetcher 経由で監視し、トースト表示や状態更新を行う
  useEffect(() => {
    // fetcher の state が 'loading' から 'idle' に変化し、かつ fetcher.data (action の戻り値) が存在する場合に処理
    if (prevFetcherStateRef.current === "loading" && fetcher.state === "idle" && fetcher.data) {
      const actionData = fetcher.data as { ok: boolean; message?: string; error?: string; errors?: any }; // 型アサーションを追加
      if (actionData.ok) {
        toast({ title: "成功", description: actionData.message || "操作が成功しました。" });
        setIsFormOpen(false); // フォームを閉じる
        setEditingKeyword(null); // 編集状態をリセット
        revalidator.revalidate(); // データが変更された可能性があるので loader を再実行して一覧を更新
      } else {
        // エラーの場合、エラーメッセージをトースト表示
        toast({ title: "エラー", description: actionData.error || "操作に失敗しました", variant: "destructive" });
      }
    }
    // 現在の fetcher.state を ref に保存し、次回の比較に使用
    prevFetcherStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, toast, revalidator]); // setIsFormOpen, setEditingKeyword は依存配列から削除可能 (useState の setter は不変)

  // 検索フィルター: 入力された searchTerm に基づき、キーワード名またはメモで絞り込む
  // フィルター対象はフラット化されたリストを使用する方が効率的かもしれないが、
  // テーブル表示は階層構造で行うため、元の階層データに対してフィルターを行う
  // (子要素にマッチした場合に親も表示するなどの考慮が必要になる場合がある)
  // 今回はシンプルに、フラットなリストでフィルターし、表示は階層データで行う
  // TODO: 階層検索の実装 (親がマッチしたら子も表示、子がマッチしたら親も表示など)
  const filterKeywords = useCallback((keywordsToFilter: Keyword[], term: string): Keyword[] => {
    if (!term) return keywordsToFilter;
    const lowerTerm = term.toLowerCase();
    const filtered: Keyword[] = [];

    const traverse = (keyword: Keyword): Keyword | null => {
      const children = keyword.childKeywords?.map(traverse).filter(Boolean) as Keyword[] | undefined;
      const isMatch = keyword.keywordName?.toLowerCase().includes(lowerTerm) ||
        keyword.memo?.toLowerCase().includes(lowerTerm);

      if (isMatch || (children && children.length > 0)) {
        // 自身がマッチするか、子孫がマッチする場合に返す
        return { ...keyword, childKeywords: children };
      }
      return null;
    };

    for (const keyword of keywordsToFilter) {
      const result = traverse(keyword);
      if (result) {
        filtered.push(result);
      }
    }
    return filtered;
  }, []);

  const filteredKeywords = filterKeywords(keywords, searchTerm); // 階層データに対してフィルター

  // 検索結果件数表示用 (フラットリストで単純にカウント)
  const flatFilteredKeywordsCount = flatKeywordsForSelect.filter((keyword: Keyword) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      keyword.keywordName?.toLowerCase().includes(searchLower) ||
      keyword.memo?.toLowerCase().includes(searchLower)
    );
  }).length;


  /** 新規追加ボタンクリック時のハンドラ: フォームを新規モードで開く */
  const handleAddNew = () => {
    setEditingKeyword(null);
    setIsFormOpen(true);
  };

  /** 編集ボタンクリック時のハンドラ (KeywordTable から呼び出される): フォームを編集モードで開く */
  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setIsFormOpen(true);
  };

  /** 削除ボタンクリック時のハンドラ (KeywordTable から呼び出される): 確認ダイアログ表示後、削除 action を実行 */
  const handleDelete = (keywordId: number) => {
    if (window.confirm(`ID: ${keywordId} のキーワードを本当に削除しますか？`)) {
      fetcher.submit({ intent: "delete", id: String(keywordId), projectId: String(projectId) }, { method: "post" });
    }
  };

  /** 行クリック時のハンドラ: 詳細サイドバーを開き、選択されたキーワードを設定 */
  const handleRowClick = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setIsDetailSidebarOpen(true);
  };

  /**
   * フォーム送信ハンドラ (KeywordFormDialog から呼び出される)
   * Zod でバリデーション済みのデータを受け取り、FormData を構築して fetcher.submit で action を実行する。
   * @param data バリデーション済みフォームデータ (CreateKeywordFormData | UpdateKeywordFormData)
   * @param intent 操作の種類 ("create" または "update")
   * @param id キーワードID (更新時のみ)
   */
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
            <p className="mt-2 text-muted-foreground">
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

        {/* 検索結果カウント (フラットリストでの単純カウント) */}
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            検索結果: {flatFilteredKeywordsCount} 件 (キーワード名・メモでの一致数)
          </div>
        )}

        {/* キーワード一覧ツリーテーブル (フィルタリングされた階層データを渡す) */}
        <div className="mt-8">
          <KeywordTreeTable
            keywords={filteredKeywords} // フィルタリングされたデータを渡す
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick} // 行クリックハンドラを追加
          />
        </div>

        {/* キーワード追加/編集フォームモーダル */}
        <KeywordFormDialog
          isOpen={isFormOpen}
          setOpen={setIsFormOpen}
          keyword={editingKeyword}
          projectId={projectId}
          allKeywords={flatKeywordsForSelect} // フラット化されたキーワードリストを渡す
          onSubmit={handleFormSubmit}
        />

        {/* キーワード詳細表示サイドバー */}
        <KeywordDetailSidebar
          isOpen={isDetailSidebarOpen}
          setOpen={setIsDetailSidebarOpen}
          keyword={selectedKeyword}
        />
      </div>
    </div>
  );
}
