import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ScrapingResultsList } from "~/components/scraping/ScrapingResultsList";
import { ScrapingSummaryCards } from "~/components/scraping/ScrapingSummaryCards"; // 新規作成したコンポーネントをインポート
import type { ArticleItem } from '~/types/article'; // ArticleItem 型をインポート
import type { CrawlStatus } from '~/types/scraping'; // CrawlStatus 型をインポート

interface ScrapingResultsTabContentProps {
  crawlStatus: CrawlStatus;
  hasResults: boolean;
  globalScrapingResults: ArticleItem[];
  filteredArticles: ArticleItem[];
  onNavigateToDetail: () => void;
}

/**
 * スクレイピング結果を表示するタブコンテンツコンポーネント
 */
export function ScrapingResultsTabContent({
  crawlStatus,
  hasResults,
  globalScrapingResults,
  filteredArticles,
  onNavigateToDetail,
}: ScrapingResultsTabContentProps) {
  return (
    <div className="space-y-6">
      {/* 追加情報セクション */}
      {crawlStatus === 'completed' && hasResults && (
        <ScrapingSummaryCards articles={globalScrapingResults} />
      )}

      {/* 結果リスト */}
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
                onClick={onNavigateToDetail}
                className="flex items-center"
              >
                詳細分析を表示
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
