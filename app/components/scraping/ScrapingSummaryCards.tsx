import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ArticleItem } from '~/types/article'; // ArticleItem 型をインポート

interface ScrapingSummaryCardsProps {
  articles: ArticleItem[];
}

/**
 * スクレイピング結果の概要を表示するカード群コンポーネント
 * 総記事数、内部リンク合計、外部リンク合計を表示します。
 */
export function ScrapingSummaryCards({ articles }: ScrapingSummaryCardsProps) {
  const totalArticles = articles.length;
  const totalInternalLinks = articles.reduce((sum, article) => sum + (article.internalLinks?.length || 0), 0);
  const totalOuterLinks = articles.reduce((sum, article) => sum + (article.outerLinks?.length || 0), 0);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">スクレイピング概要</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総記事数</CardTitle>
            {/* アイコンなど追加可能 */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内部リンク合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInternalLinks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">外部リンク合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOuterLinks}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
