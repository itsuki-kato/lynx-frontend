import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useMatches } from "react-router"; // useMatches をインポート
import { getSession, getSelectedProjectId } from "~/server/session.server"; // getSelectedProjectId をインポート
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import { Button } from "~/components/ui/button";
import type { ArticleItem } from "~/types/article";
import { useState, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { useToast } from "~/hooks/use-toast";
import { ArticleGrid } from "~/components/common/ArticleGrid"; // ArticleGridをインポート
import { redirect } from "react-router"; // redirect をインポート

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "コンテンツ管理" },
    { name: "description", content: "保存されたコンテンツの管理" },
  ];
}

// loaderが返すデータの型を定義
interface ContentLoaderData {
  articles: ArticleItem[];
  projectId: number | null;
  error: string | null;
}

export const loader = async ({ request }: Route.LoaderArgs): Promise<ContentLoaderData | Response> => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = await getSelectedProjectId(request);

  if (!token) {
    console.error("No token found in content loader, should have been redirected by root.");
    return redirect("/login");
  }

  if (!selectedProjectIdString) {
    console.error("No project selected in content loader.");
    return redirect("/projects/new"); 
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    console.error("Invalid projectId in session for content loader.");
    return redirect("/projects/new");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/articles/project/${projectId}/detailed`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const articles = await response.json();
    return { articles, projectId, error: null };
  } catch (error) {
    console.error("API fetch error:", error);
    const currentProjectId = parseInt(selectedProjectIdString || "", 10);
    return { articles: [], projectId: isNaN(currentProjectId) ? null : currentProjectId, error: error instanceof Error ? error.message : "データの取得に失敗しました" };
  }
};

export default function Content() {
  const loaderData = useLoaderData<ContentLoaderData>(); // 型を修正
  // loaderDataがResponseインスタンスである可能性は、root loaderでリダイレクトされるため低いが、型安全のためにチェック
  if (loaderData instanceof Response) {
    // この場合、UIは表示されないはず（リダイレクトされる）
    console.error("Content route received a Response object from loader, this should not happen if redirects work correctly.");
    return null; 
  }
  const { articles, projectId, error } = loaderData;

  const navigate = useNavigate();
  const matches = useMatches();
  const rootData = matches.find(match => match.id === 'root')?.data as { userProfile?: { name?: string } } | undefined;
  const userName = rootData?.userProfile?.name;
  const [selectedItem, setSelectedItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // エラーがあれば表示
  useEffect(() => {
    if (error) {
      toast({
        title: "エラー",
        description: typeof error === 'string' ? error : "不明なエラーが発生しました。", // error の型を考慮
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // 検索フィルター
  const filteredArticles = articles.filter((article: ArticleItem) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      article.metaTitle?.toLowerCase().includes(searchLower) ||
      article.metaDescription?.toLowerCase().includes(searchLower) ||
      article.articleUrl?.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-2xl font-bold">
              コンテンツ管理
          </h1>
            <p className="mt-2 text-muted-foreground">
              保存された{articles.length}件のコンテンツを表示します
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            {/* 検索ボックス */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="タイトル、URL、説明で検索..."
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/scraping")}
              className="text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              新規スクレイピング
            </Button>
          </div>
        </div>

        {/* 検索結果カウント表示 */}
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            検索結果: {filteredArticles.length} 件
          </div>
        )}

        {/* 記事グリッド表示 */}
        <ArticleGrid
          articles={filteredArticles} // フィルターされた記事を渡す
          onCardClick={handleCardClick}
          cardVariant="emerald" // emeraldテーマを使用
          noDataMessage="保存されたコンテンツがありません"
          noDataButtonText="スクレイピング画面へ"
          noDataButtonLink="/scraping"
          searchTerm={searchTerm} // 検索語を渡す
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
