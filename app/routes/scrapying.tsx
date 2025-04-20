import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useBlocker } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema, type ScrapyRequest } from "~/share/zod/schemas";
import { useScraping } from "~/hooks/use-scraping";
import type { UseScrapingReturn } from "~/types/scraping";
import { NavigationBlocker } from "~/components/scraping/NavigationBlocker";
import { PageHeader } from "~/components/scraping/PageHeader";
import { ScrapingStatus } from "~/components/scraping/ScrapingStatus";
import { ScrapingForm } from "~/components/scraping/ScrapingForm";
import { ScrapingResultsList } from "~/components/scraping/ScrapingResultsList";
import { useEffect, useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析実行 - LYNX" },
    { name: "description", content: "URLとクラス名を入力してサイト分析を実行します。" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    throw new Response("認証トークンが見つかりません", { status: 401 });
  }

  // 認証トークンをクライアントに渡す
  return { token };
};

/**
 * サイト分析実行ページ
 * 内部リンクマトリクス画面のスタイルに合わせて再構築
 */
export default function Scrapying() {
  // useLoaderData から token を取得
  const { token } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // カスタムフックを使用してスクレイピング機能を取得
  const {
    crawlStatus,
    progressInfo,
    errorMessage,
    scrapedArticles,
    jobId,
    startScraping,
    cancelScraping
  }: UseScrapingReturn = useScraping(token);

  // ナビゲーションブロッカーを設定
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      crawlStatus === 'running' && currentLocation.pathname !== nextLocation.pathname
  );

  // フォームを設定
  const form = useForm({
    resolver: zodResolver(scrapyRequestSchema),
    defaultValues: {
      startUrl: "",
      targetClass: "",
    },
  });

  // 結果の有無を確認
  const hasResults = scrapedArticles.length > 0;

  // アクティブなタブの状態管理（デフォルトはフォーム）
  const defaultTab = hasResults && crawlStatus === 'completed' ? 'results' : 'form';

  // 検索語の状態
  const [searchTerm, setSearchTerm] = useState("");
  
  // 検索フィルター
  const filteredArticles = useMemo(() => {
    if (!searchTerm) return scrapedArticles;
    
    return scrapedArticles.filter(article => 
      article.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.articleUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scrapedArticles, searchTerm]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* ページヘッダー（固定表示されない） */}
      <div className="container py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">サイト分析ツール</h1>
        <p className="text-muted-foreground">
          URLとクラス名を入力して、ウェブサイトの構造を分析します。
        </p>
      </div>

      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <div className="container max-w-7xl mx-auto mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* スクレイピング状態表示 - スティッキーヘッダーとして表示 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
        <div className="container max-w-7xl mx-auto py-3">
          <ScrapingStatus
            crawlStatus={crawlStatus}
            progressInfo={progressInfo}
            errorMessage={errorMessage}
          />
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-grow py-4 w-full overflow-auto">
        <div className="container max-w-7xl mx-auto">
          {/* タブインターフェース */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="form">
                    フォーム
                  </TabsTrigger>
                  <TabsTrigger value="results" disabled={!hasResults}>
                    結果
                    {hasResults && (
                      <Badge variant="secondary" className="ml-2">
                        {scrapedArticles.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 検索フィールド（結果タブ用） */}
              {defaultTab === 'results' && hasResults && (
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="タイトル、URL、説明で検索..."
                    className="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => setSearchTerm("")}
                      aria-label="検索をクリア"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* ジョブID表示 */}
              {jobId && (
                <div className="text-xs text-muted-foreground">
                  ジョブID: <span className="font-mono">{jobId}</span>
                </div>
              )}
            </div>

            {/* フォームタブコンテンツ */}
            <TabsContent value="form" className="mt-0">
              <div className="border rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">スクレイピング設定</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    分析対象のURLとコンテンツを含むHTML要素のクラス名を入力してください
                  </p>
                  <ScrapingForm
                    form={form}
                    onSubmit={startScraping}
                    crawlStatus={crawlStatus}
                    onCancel={() => cancelScraping(false)}
                  />
                  <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                    <p>※ スクレイピングはサーバーリソースを消費します。適切な間隔を空けてご利用ください。</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 結果タブコンテンツ */}
            <TabsContent value="results" className="mt-0">
              {/* 追加情報セクション */}
              {crawlStatus === 'completed' && hasResults && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">スクレイピング概要</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">総記事数</p>
                      <p className="text-2xl font-bold">{scrapedArticles.length}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">内部リンク合計</p>
                      <p className="text-2xl font-bold">
                        {scrapedArticles.reduce((sum, article) => sum + (article.internalLinks?.length || 0), 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">外部リンク合計</p>
                      <p className="text-2xl font-bold">
                        {scrapedArticles.reduce((sum, article) => sum + (article.outerLinks?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">スクレイピング結果</h3>
                    {hasResults && (
                      <div className="flex items-center">
                        <Badge variant="secondary">
                          {filteredArticles.length}/{scrapedArticles.length}件
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    取得した記事データの一覧です
                  </p>
                  <div className="overflow-x-hidden">
                    <ScrapingResultsList articles={filteredArticles} />
                  </div>
                  {hasResults && (
                    <div className="mt-6 pt-4 border-t flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/scraping/result")}
                        className="flex items-center"
                      >
                        詳細分析を表示
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
