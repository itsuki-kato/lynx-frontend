import type { ArticleItem } from '~/types/article';
import { Badge } from '~/components/ui/badge';

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
        <h3 className="font-semibold mb-1">タイトル</h3>
        <p className="text-sm text-muted-foreground">{article.metaTitle}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-1">URL</h3>
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
        <h3 className="font-semibold mb-1">ディスクリプション</h3>
        <p className="text-sm text-muted-foreground">{article.metaDescription || '未設定'}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-1">見出し (H1)</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          {article.headings?.filter(h => h.tag === 'h1').map((h, index) => (
            <li key={`h1-${index}`}>{h.text}</li>
          )) || <li>未設定</li>}
        </ul>
      </div>
      <div className="flex gap-4">
        <div>
          <h3 className="font-semibold mb-1">発リンク</h3>
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground">{article.internalLinks?.length ?? 0} 件</p>
            {article.internalLinks && article.internalLinks.length > 0 ? (
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                リンクあり
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                リンクなし
              </Badge>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-1">被リンク</h3>
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground">{article.linkedFrom?.length ?? 0} 件</p>
            {article.linkedFrom && article.linkedFrom.length > 0 ? (
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                リンクあり
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                リンクなし
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
