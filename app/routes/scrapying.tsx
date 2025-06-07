import type { Route } from "./+types/scrapying";
import { useNavigate, useBlocker, useMatches } from "react-router";
import { getSession, getSelectedProjectIdFromSession, commitSession } from "~/server/session.server";
import { redirect } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema, type ScrapyRequest } from "~/share/zod/schemas";
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
import {
  crawlStatusAtom,
  progressInfoAtom,
  scrapingErrorMessageAtom,
  scrapingJobIdAtom
} from '~/atoms/scraping';
import type { CrawlStatus } from '~/types/scraping';
import { useScraping } from "~/hooks/use-scraping";
import { ScrapingStatus } from "~/components/scraping/ScrapingStatus";
import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ScrapingPageHeader } from "~/components/scraping/ScrapingPageHeader";
import { ScrapingTabs } from "~/components/scraping/ScrapingTabs";
import { ScrapingFormTabContent } from "~/components/scraping/ScrapingFormTabContent";
import { ScrapingResultsTabContent } from "~/components/scraping/ScrapingResultsTabContent";
import type { ArticleItem } from "~/types/article";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析実行 - LYNX" },
    { name: "description", content: "URLとクラス名を入力してサイト分析を実行します。" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const selectedProjectIdString = getSelectedProjectIdFromSession(session);

  if (!selectedProjectIdString) {
    console.error("No project selected in loader.");
    return redirect(
      "/projects/new",
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  return { projectId };
};

/**
 * サイト分析実行ページ
 */
export default function Scrapying({ loaderData }: Route.ComponentProps) {
  // loaderで取得したデータを使用
  const { projectId } = loaderData;

  const navigate = useNavigate();

  // useScraping フックを使用してスクレイピング機能を取得
  const { startScraping, cancelScraping } = useScraping();

  const [crawlStatus] = useAtom(crawlStatusAtom);
  const [progressInfo] = useAtom(progressInfoAtom);
  const [errorMessage] = useAtom(scrapingErrorMessageAtom);
  const [jobId] = useAtom(scrapingJobIdAtom);
  const [globalScrapingResults] = useAtom(articlesAtom);

  // スクレイピング中はページ遷移をブロック
  useBlocker(
    ({ currentLocation, nextLocation }) =>
      crawlStatus === 'running' && currentLocation.pathname !== nextLocation.pathname
  );

  // Formの初期値とバリデーションスキーマを設定
  const form = useForm<ScrapyRequest>({
    resolver: zodResolver(scrapyRequestSchema),
    defaultValues: {
      startUrl: "",
      targetClass: "",
    },
  });

  const hasResults = globalScrapingResults.length > 0;
  const defaultTab = hasResults && crawlStatus === 'completed' ? 'results' : 'form';
  const [searchTerm, setSearchTerm] = useState("");

  // 検索結果のフィルタリング
  const filteredArticles = useMemo(() => {
    if (!searchTerm) return globalScrapingResults as ArticleItem[];
    return (globalScrapingResults as ArticleItem[]).filter(article =>
      article.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.articleUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [globalScrapingResults, searchTerm]);

  // 詳細ボタン押下時の処理
  const handleNavigateToDetail = () => {
    navigate("/scraping/result");
  };

  return (
    <div className="flex flex-col py-12 px-4">
      <ScrapingPageHeader />

      {errorMessage && (
        <div className="container max-w-7xl mx-auto my-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
        <div className="container max-w-7xl mx-auto py-3">
          <ScrapingStatus
            crawlStatus={crawlStatus}
            progressInfo={progressInfo}
            errorMessage={errorMessage}
          />
        </div>
      </div>

      <div className="flex-grow py-4 w-full overflow-auto">
        <div className="container max-w-7xl mx-auto">
          <ScrapingTabs
            defaultTab={defaultTab}
            hasResults={hasResults}
            crawlStatus={crawlStatus}
            globalScrapingResults={globalScrapingResults as ArticleItem[]}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            jobId={jobId}
            onNavigateToDetail={handleNavigateToDetail}
            formComponent={
              <ScrapingFormTabContent
                form={form}
                onSubmit={async (data) => await startScraping(data)}
                crawlStatus={crawlStatus as CrawlStatus}
                onCancel={async () => await cancelScraping(false)}
              />
            }
            resultsComponent={
              <ScrapingResultsTabContent
                crawlStatus={crawlStatus as CrawlStatus}
                hasResults={hasResults}
                globalScrapingResults={globalScrapingResults as ArticleItem[]}
                filteredArticles={filteredArticles}
                onNavigateToDetail={handleNavigateToDetail}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
