import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowRight, Search, X } from "lucide-react";
import type { ArticleItem } from '~/types/article';
import type { CrawlStatus } from '~/types/scraping';

interface ScrapingTabsProps {
  defaultTab: string;
  hasResults: boolean;
  crawlStatus: CrawlStatus;
  globalScrapingResults: ArticleItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  jobId: string | null;
  formComponent: React.ReactNode;
  resultsComponent: React.ReactNode;
  onNavigateToDetail: () => void;
}

/**
 * スクレイピングページのタブUIを管理するコンポーネント
 */
export function ScrapingTabs({
  defaultTab,
  hasResults,
  crawlStatus,
  globalScrapingResults,
  searchTerm,
  setSearchTerm,
  jobId,
  formComponent,
  resultsComponent,
  onNavigateToDetail,
}: ScrapingTabsProps) {
  return (
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
                  {globalScrapingResults.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          {crawlStatus === 'completed' && hasResults && (
            <Button
              size="sm"
              onClick={onNavigateToDetail}
              className="flex items-center ml-4"
            >
              詳細分析を表示
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* 検索フィールド（結果タブ表示時かつ結果がある場合） */}
        {defaultTab === 'results' && hasResults && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="タイトル、URL、説明で検索..."
              className="w-full pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchTerm("")}
                aria-label="検索をクリア"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {jobId && (
          <div className="text-xs text-muted-foreground">
            ジョブID: <span className="font-mono">{jobId}</span>
          </div>
        )}
      </div>

      <TabsContent value="form" className="mt-0">
        {formComponent}
      </TabsContent>
      <TabsContent value="results" className="mt-0">
        {resultsComponent}
      </TabsContent>
    </Tabs>
  );
}
