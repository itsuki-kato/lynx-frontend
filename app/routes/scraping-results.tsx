import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useActionData, Form, useNavigation, useMatches } from "react-router"; // useNavigation, useMatches をインポート
import { getSession } from "~/utils/session.server";
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { getSelectedProjectId } from "~/utils/session.server"; // getSelectedProjectId をインポート
import { redirect } from "react-router"; // redirect をインポート
import { useAtom } from "jotai";
import { articlesAtom } from "~/atoms/article";
import type { ArticleItem } from "~/types/article";
import { useState, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { useToast } from "~/hooks/use-toast";
import { useResetAtom } from "jotai/utils";
import type { HeadingItem } from "~/types/article";
import { ArticleGrid } from "~/components/common/ArticleGrid";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "スクレイピング結果" },
    { name: "description", content: "スクレイピング結果の表示" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェックは root loader で行われるため削除
  // await requireAuth(request);

  // user 情報は root loader から取得するため、ここでは何も返さないか、
  // このルート固有のデータがあればそれを返す。今回は loader 自体不要になる可能性もあるが、
  // action で token を使うため、session 取得は残す場合もある。
  // ただし、この loader がコンポーネントにデータを渡す目的でなければ、
  // loader 自体を削除または空のオブジェクトを返すようにしても良い。
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = await getSelectedProjectId(request);

  if (!token) {
    return redirect("/login");
  }
  if (!selectedProjectIdString) {
    return redirect("/projects/new");
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    return redirect("/projects/new");
  }

  // このloaderでは特にデータを渡す必要がなければ、projectIdとtokenを返すだけでも良い
  // actionで再度読み込むので、ここでは必須ではない
  return { projectId, token }; 
};

// ArticleItem から ArticleDto への変換関数
function convertToArticleDto(article: ArticleItem) {
  return {
    articleUrl: article.articleUrl,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    isIndexable: article.isIndexable || false,
    internalLinks: article.internalLinks?.map(link => ({
      linkUrl: link.linkUrl,
      anchorText: link.anchorText || undefined,
      isFollow: link.isFollow || false,
      status: {
        code: link.status?.code || 0,
        redirectUrl: link.status?.redirectUrl || ""
      }
    })) || [],
    outerLinks: article.outerLinks?.map(link => ({
      linkUrl: link.linkUrl,
      anchorText: link.anchorText || undefined,
      isFollow: link.isFollow || false,
      status: {
        code: link.status?.code || 0,
        redirectUrl: link.status?.redirectUrl || ""
      }
    })) || [],
    headings: convertHeadings(article.headings || []),
    jsonLd: article.jsonLd || []
  };
}

// 再帰的に見出しを変換する関数
function convertHeadings(headings: HeadingItem[]): any[] {
  return headings.map(heading => ({
    tag: heading.tag,
    text: heading.text,
    children: heading.children ? convertHeadings(heading.children) : []
  }));
}

// action関数の戻り値の型を定義
type ActionResponse = { ok: true } | { ok: false; error: string };

export const action = async ({ request }: Route.ActionArgs): Promise<Response> => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = await getSelectedProjectId(request);

  if (!token) {
    // 通常はroot loaderで処理されるが、念のため
    return new Response(JSON.stringify({ ok: false, error: "認証されていません" } as ActionResponse), { status: 401, headers: { 'Content-Type': 'application/json' }});
  }
  if (!selectedProjectIdString) {
    return new Response(JSON.stringify({ ok: false, error: "プロジェクトが選択されていません" } as ActionResponse), { status: 400, headers: { 'Content-Type': 'application/json' }});
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    return new Response(JSON.stringify({ ok: false, error: "無効なプロジェクトIDです" } as ActionResponse), { status: 400, headers: { 'Content-Type': 'application/json' }});
  }

  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "save") {
    try {
      const articlesDataString = formData.get("articlesData");
      if (!articlesDataString) {
        return new Response(JSON.stringify({ ok: false, error: "記事データが見つかりません" } as ActionResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const articlesToSave = JSON.parse(articlesDataString as string);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scraping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: projectId, // 動的に取得したprojectIdを使用
          articles: articlesToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `API error: ${response.status}` }));
        return new Response(JSON.stringify({ ok: false, error: errorData.message || `API error: ${response.status}` } as ActionResponse), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ ok: true } as ActionResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Save error:", error);
      return new Response(JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "保存中にエラーが発生しました"
      } as ActionResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // _action が 'save' 以外の場合は適切なエラーレスポンスを返す
  return new Response(JSON.stringify({ ok: false, error: "Invalid action" } as ActionResponse), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
};

export default function ScrapingResults() {
  // const { user } = useLoaderData(); // user は loader から削除
  const matches = useMatches();
  const rootData = matches.find(match => match.id === 'root')?.data as { userProfile?: { name?: string } } | undefined;
  const userName = rootData?.userProfile?.name; // 必要であれば利用

  const [results] = useAtom(articlesAtom);
  const resetArticles = useResetAtom(articlesAtom);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const actionData = useActionData<ActionResponse>(); // 定義した ActionResponse 型を使用
  const { toast } = useToast();
  const [saveCompleted, setSaveCompleted] = useState(false);
  const navigation = useNavigation(); // useNavigation フックを使用
  const isSaving = navigation.state === 'submitting' && navigation.formData?.get('_action') === 'save'; // 保存中かどうかを判定

  /**
   * コンテンツ管理へボタンをクリックしたときの処理
   */
  const handleNavigateContent = () => {
    resetArticles(); // articlesAtomをリセット
    navigate("/content");
  }

  // 保存結果に応じてトースト通知を表示
  useEffect(() => {
    // actionData が存在する場合のみ処理
    if (actionData) {
      if (actionData.ok === true) { // actionData.ok が true かどうかをチェック
        toast({
          title: "保存完了",
          description: "スクレイピング結果をDBに保存しました",
          variant: "default",
        });

        setSaveCompleted(true);
      } else if (actionData.ok === false) { // actionData.ok が false の場合 (エラーケース)
        toast({
          title: "エラー",
          description: actionData.error || "保存に失敗しました", // actionData.error を表示
          variant: "destructive",
        });
      }
    }
  }, [actionData, toast]);

  // カードクリック時の処理
  const handleCardClick = (item: ArticleItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                スクレイピング結果
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              取得した{results.length}件のデータを表示します
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/scraping")}
              className="text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              スクレイピング画面に戻る
            </Button>

            {results.length > 0 && !saveCompleted ? (
              // 保存が完了していない場合は「DBに保存する」ボタンを表示
              <Form method="post">
                <input type="hidden" name="_action" value="save" />
                <input
                  type="hidden"
                  name="articlesData"
                  value={JSON.stringify(results.map(item => convertToArticleDto(item)))}
                />
                <Button
                  type="submit"
                  disabled={isSaving} // 保存中はボタンを無効化
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* ローディングアイコン */}
                      保存中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                      </svg>
                      DBに保存する
                    </>
                  )}
                </Button>
              </Form>
            ) : saveCompleted && (
              // 保存が完了した場合は「コンテンツ管理へ」ボタンを表示
              <Button
                variant="outline"
                onClick={handleNavigateContent}
                className="text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                コンテンツ管理へ
              </Button>
            )}
          </div>
        </div>

        {/* 記事グリッド表示 */}
        <ArticleGrid
          articles={results}
          onCardClick={handleCardClick}
          cardVariant="emerald" // ScrapingResultsではemeraldテーマを使用
          noDataMessage="スクレイピングを実行して結果を取得してください"
          noDataButtonText="スクレイピング画面へ"
          noDataButtonLink="/scraping"
        />
      </div>

      {/* 詳細表示モーダル */}
      {selectedItem && (
        <ScrapingResultModal
          item={selectedItem}
          isOpen={isDialogOpen}
          setOpen={setIsDialogOpen}
        />
      )}
    </div>
  );
}
