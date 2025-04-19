import type { ArticleItem } from '~/types/article';
import { Badge } from '~/components/ui/badge';
import { HeadingList } from '~/components/scraping/HeadingList';
import { Type, Link, Heading1, Heading2, Heading3 } from "lucide-react";

interface ArticleBasicInfoProps {
  article: ArticleItem;
}

/**
 * 記事の基本情報を表示するコンポーネント
 */
export function ArticleBasicInfo({ article }: ArticleBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <Badge variant="outline" className="mb-2 px-3 py-1 text-base font-semibold flex items-center">
          <Type className="h-4 w-4 mr-2 text-primary" />
          タイトル
        </Badge>
        <p className="text-sm text-muted-foreground">{article.metaTitle}</p>
      </div>
      <div>
        <Badge variant="outline" className="mb-2 px-3 py-1 text-base font-semibold flex items-center">
          <Link className="h-4 w-4 mr-2 text-primary" />
          URL
        </Badge>
        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          {article.articleUrl}
        </a>
      </div>
      <div>
        <Badge variant="outline" className="mb-2 px-3 py-1 text-base font-semibold flex items-center">
          <div className="flex items-center mr-1 text-primary">
            <Heading1 className="h-4 w-4" />
            <Heading2 className="h-3 w-3 -ml-1" />
            <Heading3 className="h-2 w-2 -ml-1" />
          </div>
          見出し構造
        </Badge>
        {article.headings && article.headings.length > 0 ? (
          <HeadingList headings={article.headings} />
        ) : (
          <p className="text-sm text-muted-foreground">見出しがありません</p>
        )}
      </div>
    </div>
  );
}
