import type { Route } from "./+types/content";
import { useLoaderData, useNavigate } from "react-router";
import { getSession, getSelectedProjectIdFromSession, commitSession } from "~/server/session.server";
import { Button } from "~/components/ui/button";
import type { ArticleItem, ContentLoaderData, PaginatedArticlesResponse, ArticleMinimalItem } from "~/types/article";
import { useState, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { useToast } from "~/hooks/use-toast";
import { ArticleGrid } from "~/components/common/ArticleGrid";
import { redirect } from "react-router";
import { MultipleScrapingDialog } from "~/components/scraping/MultipleScrapingDialog";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "コンテンツ管理" },
    { name: "description", content: "保存されたコンテンツの管理" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs): Promise<ContentLoaderData | Response> => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token") as string | null;
  const selectedProjectIdString = getSelectedProjectIdFromSession(session);

  // トークンが無い場合はログイン画面にリダイレクト
  if (!token) {
    console.error("No token found in content loader, should have been redirected by root.");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
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
    const initialTake = 10; // 初期表示件数
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/articles/project/${projectId}/feed?take=${initialTake}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: PaginatedArticlesResponse = await response.json();
    return {
      articles: data.articles,
      projectId,
      initialHasNextPage: data.hasNextPage,
      initialNextCursor: data.nextCursor,
      error: null,
      token: token
    };
  } catch (error) {
    console.error("API fetch error:", error);
    const currentProjectId = parseInt(selectedProjectIdString || "", 10);
    return {
      articles: [],
      projectId: isNaN(currentProjectId) ? null : currentProjectId,
      initialHasNextPage: false,
      initialNextCursor: null,
      error: error instanceof Error ? error.message : "データの取得に失敗しました",
      token: token
    };
  }
};

export default function Content({ loaderData }: Route.ComponentProps) {
  const {
    articles: initialArticles,
    projectId,
    initialHasNextPage,
    initialNextCursor,
    error,
    token
  } = loaderData;

  const navigate = useNavigate();
  const [displayedArticles, setDisplayedArticles] = useState<ArticleItem[]>(initialArticles);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // 複数URLスクレイピング機能用の状態
  const [isMultipleScrapingDialogOpen, setIsMultipleScrapingDialogOpen] = useState(false);
  const [allMinimalArticles, setAllMinimalArticles] = useState<ArticleMinimalItem[]>([]);
  const [isLoadingMinimalArticles, setIsLoadingMinimalArticles] = useState(false);

  // エラーがあれば表示
  useEffect(() => {
    if (error) {
      toast({
        title: "エラー",
        description: typeof error === 'string' ? error : "不明なエラーが発生しました。",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const fetchMoreArticles = async () => {
    if (!hasNextPage || isLoadingMore || !projectId || !nextCursor || !token) return;

    setIsLoadingMore(true);
    try {
      const take = 20; // 一度に読み込む件数
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/articles/project/${projectId}/feed?take=${take}&cursor=${nextCursor}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data: PaginatedArticlesResponse = await response.json();
      setDisplayedArticles(prevArticles => [...prevArticles, ...data.articles]);
      setHasNextPage(data.hasNextPage);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("Failed to fetch more articles:", err);
      toast({
        title: "エラー",
        description: "記事の追加読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 検索フィルター (displayedArticles を元にする)
  const filteredArticles = displayedArticles.filter((article: ArticleItem) => {
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

  // minimal記事データを取得する関数
  const fetchMinimalArticles = async () => {
    if (!projectId || !token || allMinimalArticles.length > 0) return;

    setIsLoadingMinimalArticles(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/articles/project/${projectId}/minimal`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data: ArticleMinimalItem[] = await response.json();
      setAllMinimalArticles(data);
    } catch (err) {
      console.error("Failed to fetch minimal articles:", err);
      toast({
        title: "エラー",
        description: "記事一覧の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMinimalArticles(false);
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">
              コンテンツ管理
            </h1>
            <p className="mt-2 text-muted-foreground">
              {searchTerm
                ? `検索結果: ${filteredArticles.length} 件`
                : `コンテンツ一覧 (現在 ${displayedArticles.length} 件表示中${hasNextPage ? '、さらに読み込めます' : ''})`
              }
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
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0011.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              新規スクレイピング
            </Button>

            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setIsMultipleScrapingDialogOpen(true);
                fetchMinimalArticles();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              選択してスクレイピング
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

        {/* もっと見るボタン */}
        {hasNextPage && !searchTerm && (
          <div className="mt-8 text-center">
            <Button onClick={fetchMoreArticles} disabled={isLoadingMore} variant="outline">
              {isLoadingMore ? "読み込み中..." : "もっと見る"}
            </Button>
          </div>
        )}
      </div>

      {/* 詳細表示モーダル */}
      {selectedItem && (
        <ScrapingResultModal
          item={selectedItem}
          isOpen={isDialogOpen}
          setOpen={setIsDialogOpen}
        />
      )}

      {/* 複数URLスクレイピングダイアログ */}
      {projectId && token && (
        <MultipleScrapingDialog
          isOpen={isMultipleScrapingDialogOpen}
          onOpenChange={setIsMultipleScrapingDialogOpen}
          allMinimalArticles={allMinimalArticles}
          isLoadingMinimalArticles={isLoadingMinimalArticles}
          projectId={projectId}
          token={token}
        />
      )}
    </div>
  );
}
