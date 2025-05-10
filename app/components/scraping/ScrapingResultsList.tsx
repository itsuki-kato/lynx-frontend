import React from 'react';
import { Badge } from '~/components/ui/badge';
import { ExternalLink, Link2, FileText } from 'lucide-react'; // FileText をインポート
import type { ArticleItem } from '~/types/article';

interface ScrapingResultsListProps {
  articles: ArticleItem[];
}

/**
 * スクレイピング結果リストコンポーネント
 * 内部リンクマトリクス画面のスタイルに合わせて再構築
 */
export function ScrapingResultsList({ articles }: ScrapingResultsListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed rounded-lg">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" /> {/* lucide-react アイコンに変更 */}
        </div>
        <h3 className="text-base font-medium mb-2">データがありません</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          スクレイピングを実行すると、ここに結果が表示されます。
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 結果リスト */}
      <ul className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto pr-1">
        {articles.map((article, index) => (
          <li key={index} className="border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors">
            <a 
              href={article.articleUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block p-3"
            >
              <div className="flex flex-col w-full">
                <div className="flex flex-wrap items-start justify-between gap-2 w-full">
                  <h4 className="font-medium line-clamp-1 hover:underline break-words">
                    {article.metaTitle || article.articleUrl}
                  </h4>
                  <div className="flex flex-wrap gap-1 flex-shrink-0">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Link2 className="h-3 w-3" />
                      {article.internalLinks?.length || 0}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      {article.outerLinks?.length || 0}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {article.metaDescription || article.articleUrl}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                  {article.articleUrl}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
