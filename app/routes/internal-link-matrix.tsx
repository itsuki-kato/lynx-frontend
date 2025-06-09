import type { Route } from "../+types/root";
import { useLoaderData, useMatches } from "react-router"; // useMatches をインポート
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "~/hooks/use-toast";
import { getSession, getSelectedProjectIdFromSession } from "~/server/session.server";
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import type { UserProfile } from "~/types/user"; // UserProfile をインポート
import { redirect } from "react-router"; // redirect をインポート
import { analyzeSeoWithGemini } from "~/server/gemini.server";
import type { ArticleItem } from "~/types/article";
import InternalLinkMatrix from '~/components/matrix/InternalLinkMatrix';
import ArticleDetailSidebar from '~/components/matrix/sidebar/ArticleDetailSidebar';
import MatrixSearchFilter from '~/components/matrix/MatrixSearchFilter';
import MatrixStats from '~/components/matrix/MatrixStats';
import AiAnalysisSection from '~/components/matrix/AiAnalysisSection';
import { useOverallAnalysis } from '~/hooks/useOverallAnalysis';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// meta関数
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "内部リンク マトリクス | LYNX" },
    { name: "description", content: "記事間の内部リンク構造をマトリクス表示します" },
  ];
}

// loader関数
export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェックは root loader で行われるため削除
  // await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = getSelectedProjectIdFromSession(session);

  if (!token) {
    console.error("No token found in internal-link-matrix loader, should have been redirected by root.");
    return redirect("/login");
  }
  if (!selectedProjectIdString) {
    console.error("No project selected in internal-link-matrix loader.");
    return redirect("/projects/new");
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    console.error("Invalid projectId in session for internal-link-matrix loader.");
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
    return { articles, projectId, error: null }; // projectId も返す
  } catch (error) {
    console.error("API fetch error:", error);
    return { articles: [], projectId, error: error instanceof Error ? error.message : "データの取得に失敗しました" }; // projectId も返す
  }
};

// action関数 - 個別記事のSEO分析
export const action = async ({ request }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  // action内でもプロジェクトIDが必要な場合はセッションから取得
  // const selectedProjectIdString = await getSelectedProjectId(request);
  // if (!selectedProjectIdString) { /* エラー処理 */ }
  // const currentProjectId = parseInt(selectedProjectIdString, 10);
  // if (isNaN(currentProjectId)) { /* エラー処理 */ }


  if (!token) {
    console.error("No token found in internal-link-matrix action, should have been redirected by root.");
    return {
      success: false,
      analysis: {
        error: true,
        message: "認証トークンが見つかりません"
      }
    };
  }

  const formData = await request.formData();
  const articleId = formData.get('articleId') as string;

  if (!articleId) {
    return {
      success: false,
      analysis: {
        error: true,
        message: "記事IDが指定されていません"
      }
    };
  }

  try {
    // 特定の記事データを取得
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/articles/${articleId}/detailed`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const articleData = await response.json();

    // 記事個別のSEO分析を実行
    const articleAnalysis = await analyzeSeoWithGemini({
      ...articleData,
      isOverallAnalysis: false
    });

    return {
      success: true,
      analysis: articleAnalysis
    };
  } catch (error) {
    console.error("Article analysis error:", error);
    return {
      success: false,
      analysis: {
        error: true,
        message: error instanceof Error ? error.message : "分析に失敗しました"
      }
    };
  }
};

// デフォルトエクスポート
export default function InternalLinkMatrixRoute() {
  const { articles, error: loaderError } = useLoaderData<typeof loader>(); // user を削除
  const matches = useMatches();
  const rootData = matches.find(match => match.id === 'root')?.data as { userProfile?: UserProfile } | undefined;
  const userProfile = rootData?.userProfile; // 必要であれば利用

  const { runAnalysis, analysisResult, isLoading: isAnalysisLoading, error: analysisError } = useOverallAnalysis();
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ source: ArticleItem, target: ArticleItem } | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'articleDetail' | 'linkDetail'>('articleDetail');
  const [linkListType, setLinkListType] = useState<'incoming' | 'outgoing' | null>(null);
  const [initialTab, setInitialTab] = useState<'basic' | 'links' | 'seo'>('basic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(480); // サイドバーの幅を状態として管理
  const { toast } = useToast(); // エラー表示用
  const [searchTerm, setSearchTerm] = useState(""); // 検索語
  const [filterType, setFilterType] = useState<"all" | "hasLinks" | "noLinks" | "isolated" | "needsIncoming" | "needsOutgoing">("all");

  // エラーハンドリング (loaderからのエラー)
  useEffect(() => {
    if (loaderError) {
      toast({
        title: "データ読み込みエラー",
        description: loaderError,
        variant: "destructive",
      });
    }
  }, [loaderError, toast]);

  // 検索とフィルタリング
  const filteredArticles = useMemo(() => {
    return articles.filter((article: ArticleItem) => {
      // 検索フィルター
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" ||
        article.metaTitle?.toLowerCase().includes(searchLower) ||
        article.metaDescription?.toLowerCase().includes(searchLower) ||
        article.articleUrl?.toLowerCase().includes(searchLower);

      // リンク状態の判定
      const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
      const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

      // フィルタータイプに応じた絞り込み
      switch (filterType) {
        case "hasLinks":
          return matchesSearch && (hasOutgoingLinks || hasIncomingLinks);
        case "noLinks":
          return matchesSearch && !hasOutgoingLinks && !hasIncomingLinks;
        case "isolated":
          return matchesSearch && !hasOutgoingLinks && !hasIncomingLinks;
        case "needsIncoming":
          return matchesSearch && hasOutgoingLinks && !hasIncomingLinks;
        case "needsOutgoing":
          return matchesSearch && !hasOutgoingLinks && hasIncomingLinks;
        default:
          return matchesSearch;
      }
    });
  }, [articles, searchTerm, filterType]);

  // ヘッダー（タイトルセル）がクリックされたときの処理
  const handleHeaderClick = (article: ArticleItem, type: 'incoming' | 'outgoing') => {
    setSidebarMode('articleDetail');
    setSelectedArticle(article);
    setLinkListType(type); // incoming または outgoing
    setInitialTab('basic'); // 基本情報タブを初期表示
    setSelectedLink(null); // リンク詳細はクリア
    setIsSidebarOpen(true);
  };

  // リンク数セルがクリックされたときの処理
  const handleLinkCountClick = (article: ArticleItem, type: 'incoming' | 'outgoing') => {
    setSidebarMode('articleDetail');
    setSelectedArticle(article);
    setLinkListType(type); // incoming または outgoing
    setInitialTab('links'); // リンクタブを初期表示
    setSelectedLink(null); // リンク詳細はクリア
    setIsSidebarOpen(true);
  };

  // マトリクスセル（チェックマーク）がクリックされたときの処理
  const handleLinkCellClick = (sourceArticle: ArticleItem, targetArticle: ArticleItem) => {
    setSidebarMode('linkDetail');
    setSelectedLink({ source: sourceArticle, target: targetArticle });
    setSelectedArticle(null); // 記事詳細はクリア
    setLinkListType(null); // リスト種別もクリア
    setIsSidebarOpen(true);
  };

  // サイドバーを閉じる処理
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    // 状態をリセット
    setSelectedArticle(null);
    setSelectedLink(null);
    setLinkListType(null);
    // sidebarMode は閉じるときにリセットしなくても良いかもしれないが、念のため
    setSidebarMode('articleDetail');
  };

  // サイドバーの幅が変更されたときの処理
  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  return (
    <div className="container mx-auto py-8">
      {/* ページヘッダー（固定表示されない） */}
      <div className="container max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">内部リンク マトリクス</h1>
        <p className="text-muted-foreground">
          記事間の内部リンクの有無をマトリクス形式で表示します。行が被リンク記事、列が発リンク記事です。
        </p>
      </div>

      {/* エラーメッセージ表示 (loaderからのエラー) */}
      {loaderError && (
        <div className="container mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>データ読み込みエラー</AlertTitle>
            <AlertDescription>{loaderError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 検索・フィルター・AI分析ボタン部分（固定表示） */}
      <div className="sticky top-0 z-10 bg-background mb-4">
        <div className="py-3 flex flex-wrap items-center gap-4 max-w-7xl">
          <MatrixSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            articles={articles}
            filteredArticles={filteredArticles}
          />
          {/* AI分析セクション */}
          <AiAnalysisSection
            runAnalysis={runAnalysis}
            analysisResult={analysisResult}
            isLoading={isAnalysisLoading}
            error={analysisError}
          />
        </div>
      </div>

      {/* マトリクス表示エリア */}
      <div className="flex-grow py-4 overflow-auto">
        <div
          className="border rounded-lg overflow-x-auto h-full"
          style={{
            width: '100%',
            marginLeft: 0,
            marginRight: isSidebarOpen ? `${sidebarWidth}px` : 0,
            transition: 'margin-right 300ms ease-in-out'
          }}
        >
          {filteredArticles && filteredArticles.length > 0 ? (
            <InternalLinkMatrix
              articles={filteredArticles}
              onHeaderClick={handleHeaderClick}
              onLinkCountClick={handleLinkCountClick}
              onLinkCellClick={handleLinkCellClick}
            />
          ) : (
            !loaderError && ( // loaderErrorがない場合のみ表示
              <div className="p-8 text-center">
                <p className="text-muted-foreground">表示する記事データがありません。</p>
                {searchTerm || filterType !== "all" ? (
                  <p className="text-sm mt-2">検索条件を変更してみてください。</p>
                ) : null}
              </div>
            )
          )}
        </div>
      </div>

      {/* 詳細表示サイドバー - 固定位置で配置されるため、マトリクス表示エリアの外に配置 */}
      <ArticleDetailSidebar
        article={selectedArticle} // articleDetail モード用
        selectedLink={selectedLink} // linkDetail モード用
        sidebarMode={sidebarMode}
        linkListType={linkListType} // articleDetail モードでリンク一覧表示用
        initialTab={initialTab} // 初期表示タブ
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        articles={articles} // 全記事データを渡す（フィルタリングされていない元データ）
        onWidthChange={handleSidebarWidthChange} // サイドバーの幅が変更されたときのコールバック
      />
    </div>
  );
}
