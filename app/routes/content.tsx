import type { Route } from "./+types/home";
import { useLoaderData, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import type { ArticleItem } from "~/types/article";
import { useState, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { useToast } from "~/hooks/use-toast";
import { ArticleGrid } from "~/components/common/ArticleGrid"; // ArticleGridをインポート

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "コンテンツ管理" },
    { name: "description", content: "保存されたコンテンツの管理" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");

  try {
    // APIを呼び出し
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scraping/project/1`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const articles = await response.json();
    return { articles, user };
  } catch (error) {
    console.error("API fetch error:", error);
    return { articles: [], user, error: error instanceof Error ? error.message : "データの取得に失敗しました" };
  }
};

export default function Content() {
  const { articles, user, error } = useLoaderData();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // エラーがあれば表示
  useEffect(() => {
    if (error) {
      toast({
        title: "エラー",
        description: error,
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
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
              コンテンツ管理
            </span>
          </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              保存された{articles.length}件のコンテンツを表示します
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto mt-4 md:mt-0">
            {/* 検索ボックス */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="タイトル、URL、説明で検索..."
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
              className="text-gray-900 dark:text-gray-100"
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
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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
