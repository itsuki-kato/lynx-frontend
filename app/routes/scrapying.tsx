import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useBlocker } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
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
import { useEffect } from "react";

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
 * スクレイピング実行ページ
 * モダンなUI/UXを実現するためにレイアウトを改善
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

  return (
    // min-h-screenを削除し、flex flex-col flex-growを追加して親要素の高さいっぱいに広げ、内部要素を縦に並べる
    <div className="bg-gradient-to-b from-background to-muted/20 flex flex-col flex-grow py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

      <div className="max-w-6xl mx-auto overflow-hidden w-full"> {/* w-fullを追加してコンテナが幅いっぱいに広がるように */}
        {/* ページヘッダー */}
        <PageHeader
          hasResults={hasResults}
          crawlStatus={crawlStatus}
          onViewResults={() => navigate("/scraping/result")}
        />

        {/* スクレイピング状態表示 - スティッキーヘッダーとして表示 */}
        <div className="sticky top-4 z-10 mb-8">
          <ScrapingStatus
            crawlStatus={crawlStatus}
            progressInfo={progressInfo}
            errorMessage={errorMessage}
          />
        </div>

        {/* メインコンテンツエリア */}
        <div className="mt-8">
          {/* タブインターフェース */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="form" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/20 dark:data-[state=active]:text-emerald-100">
                  フォーム
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-100" disabled={!hasResults}>
                  結果
                  {hasResults && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
                      {scrapedArticles.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ジョブID表示 */}
              {jobId && (
                <div className="text-xs text-muted-foreground">
                  ジョブID: <span className="font-mono">{jobId}</span>
                </div>
              )}
            </div>

            {/* フォームタブコンテンツ */}
            <TabsContent value="form" className="mt-0">
              <Card className="shadow-lg border-t-4 border-t-emerald-500 dark:border-t-emerald-400 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">スクレイピング設定</CardTitle>
                  <CardDescription>
                    分析対象のURLとコンテンツを含むHTML要素のクラス名を入力してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrapingForm
                    form={form}
                    onSubmit={startScraping}
                    crawlStatus={crawlStatus}
                    onCancel={() => cancelScraping(false)}
                  />
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                  <p>※ スクレイピングはサーバーリソースを消費します。適切な間隔を空けてご利用ください。</p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* 結果タブコンテンツ */}
            <TabsContent value="results" className="mt-0">
              {/* 追加情報セクション */}
              {crawlStatus === 'completed' && hasResults && (
                <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">スクレイピング概要</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">総記事数</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{scrapedArticles.length}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">内部リンク合計</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                        {scrapedArticles.reduce((sum, article) => sum + article.internalLinks.length, 0)}
                      </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">外部リンク合計</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
                        {scrapedArticles.reduce((sum, article) => sum + article.outerLinks.length, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <Card className="shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-blue-700 dark:text-blue-300">スクレイピング結果</CardTitle>
                    {hasResults && (
                      <Badge variant="outline" className="ml-2">
                        {scrapedArticles.length}件
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    取得した記事データの一覧です
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-hidden">
                  <ScrapingResultsList articles={scrapedArticles} />
                </CardContent>
                {hasResults && (
                  <CardFooter className="flex justify-end border-t pt-4">
                    <button
                      onClick={() => navigate("/scraping/result")}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      詳細分析を表示
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
