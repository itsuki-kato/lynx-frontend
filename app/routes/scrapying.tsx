import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useBlocker, useMatches } from "react-router"; // useMatches をインポート
import { getSession } from "~/server/session.server";
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import type { UserProfile } from "~/types/user"; // UserProfile をインポート
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { getSelectedProjectId } from "~/server/session.server"; // getSelectedProjectId をインポート
import { redirect } from "react-router"; // redirect をインポート
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input"; // Input をインポート
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema } from "~/share/zod/schemas";
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
import {
  crawlStatusAtom,
  progressInfoAtom,
  scrapingErrorMessageAtom,
  scrapingJobIdAtom
} from '~/atoms/scraping';
import { useScraping } from "~/hooks/use-scraping";
import { ScrapingStatus } from "~/components/scraping/ScrapingStatus";
import { ScrapingForm } from "~/components/scraping/ScrapingForm";
import { ScrapingResultsList } from "~/components/scraping/ScrapingResultsList";
import { useState, useMemo } from "react";
import { AlertCircle, ArrowRight, Search, X } from "lucide-react"; // アイコンをインポート
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析実行 - LYNX" },
    { name: "description", content: "URLとクラス名を入力してサイト分析を実行します。" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェックとトークン取得は root loader で行われるため削除
  // await requireAuth(request);
  // const session = await getSession(request.headers.get("Cookie"));
  // const token = session.get("token");

  // if (!token) {
  //   throw new Response("認証トークンが見つかりません", { status: 401 });
  // }

  // root loader で認証が保証されるため、この loader は基本的に不要になるか、
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

  return { token, projectId }; // token と projectId を返す
};

/**
 * サイト分析実行ページ
 * 内部リンクマトリクス画面のスタイルに合わせて再構築
 */
export default function Scrapying() {
  // useLoaderData から token を取得する代わりに root の loader データを参照
  const { token, projectId: currentProjectId } = useLoaderData<typeof loader>(); // token と projectId を取得
  const navigate = useNavigate();
  const matches = useMatches();
  // rootData は userProfile を取得する目的などで引き続き利用可能
  const rootData = matches.find(match => match.id === 'root')?.data as { isAuthenticated?: boolean, userProfile?: UserProfile } | undefined;

  // useScraping フックに loader から取得した token を渡す
  const {
    startScraping,
    cancelScraping
  } = useScraping(token); // projectId を削除

  // グローバルステートからスクレイピング状態を取得
  const [crawlStatus] = useAtom(crawlStatusAtom);
  const [progressInfo] = useAtom(progressInfoAtom);
  const [errorMessage] = useAtom(scrapingErrorMessageAtom);
  const [jobId] = useAtom(scrapingJobIdAtom);
  const [globalScrapingResults] = useAtom(articlesAtom);

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

  // 結果の有無を確認 (グローバルステートを参照)
  const hasResults = globalScrapingResults.length > 0;

  // アクティブなタブの状態管理（デフォルトはフォーム）
  const defaultTab = hasResults && crawlStatus === 'completed' ? 'results' : 'form';

  // 検索語の状態
  const [searchTerm, setSearchTerm] = useState("");

  // 検索フィルター (グローバルステートを参照)
  const filteredArticles = useMemo(() => {
    if (!searchTerm) return globalScrapingResults;

    return globalScrapingResults.filter(article =>
      article.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.articleUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [globalScrapingResults, searchTerm]);

  return (
    <div className="flex flex-col py-12 px-4">
      {/* ページヘッダー（固定表示されない） */}
      <div className="container max-w-7xl mx-auto">
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
          <div className="flex justify-between items-center">
            <ScrapingStatus
              crawlStatus={crawlStatus}
              progressInfo={progressInfo}
              errorMessage={errorMessage}
            />
          </div>
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
                        {globalScrapingResults.length} {/* グローバルステートを参照 */}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                {/* 完了状態かつ結果がある場合のみ詳細画面遷移ボタンを表示 */}
                {crawlStatus === 'completed' && hasResults && (
                  <Button
                    size="sm"
                    onClick={() => navigate("/scraping/result")} // scraping-results に遷移
                    className="flex items-center ml-4"
                  >
                    詳細分析を表示
                    <ArrowRight className="h-4 w-4 ml-1" /> {/* lucide-react アイコンに変更 */}
                  </Button>
                )}
              </div>

              {/* 検索フィールド（結果タブ用） */}
              {/* 検索フィールド（結果タブ用） - shadcn/ui の Input を使用 */}
              {defaultTab === 'results' && hasResults && (
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="タイトル、URL、説明で検索..."
                    className="w-full pl-10 pr-10" // padding調整
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" // Button を使用し、位置調整
                      onClick={() => setSearchTerm("")}
                      aria-label="検索をクリア"
                    >
                      <X className="h-4 w-4" /> {/* lucide-react アイコンに変更 */}
                    </Button>
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

            {/* フォームタブコンテンツ - Card コンポーネントを使用 */}
            <TabsContent value="form" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>スクレイピング設定</CardTitle>
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
                  <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                    <p>※ スクレイピングはサーバーリソースを消費します。適切な間隔を空けてご利用ください。</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 結果タブコンテンツ - Card コンポーネントを使用 */}
            <TabsContent value="results" className="mt-0 space-y-6"> {/* space-y を追加 */}
              {/* 追加情報セクション - Card コンポーネントを使用 */}
              {crawlStatus === 'completed' && hasResults && (
                <div> {/* 外側の div を追加 */}
                  <h3 className="text-lg font-medium mb-4">スクレイピング概要</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">総記事数</CardTitle>
                        {/* アイコンなど追加可能 */}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{globalScrapingResults.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">内部リンク合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {globalScrapingResults.reduce((sum, article) => sum + (article.internalLinks?.length || 0), 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">外部リンク合計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {globalScrapingResults.reduce((sum, article) => sum + (article.outerLinks?.length || 0), 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* 結果リスト - Card コンポーネントを使用 */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>スクレイピング結果</CardTitle>
                    {hasResults && (
                      <Badge variant="secondary">
                        {filteredArticles.length}/{globalScrapingResults.length}件
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    取得した記事データの一覧です
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-hidden">
                    <ScrapingResultsList articles={filteredArticles} />
                  </div>
                  {hasResults && (
                    <div className="mt-6 pt-4 border-t flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/scraping/result")} // scraping-results に遷移
                        className="flex items-center"
                      >
                        詳細分析を表示
                        <ArrowRight className="h-4 w-4 ml-1" /> {/* lucide-react アイコンに変更 */}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
