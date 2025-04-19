import type { ArticleItem } from '~/types/article';
import { Badge } from '~/components/ui/badge';

interface ArticleLinksListProps {
  article: ArticleItem;
  type: 'incoming' | 'outgoing' | 'both';
}

/**
 * 記事の内部リンク（発リンク・被リンク）を表示するコンポーネント
 */
export function ArticleLinksList({ article, type }: ArticleLinksListProps) {
  const showOutgoing = type === 'outgoing' || type === 'both';
  const showIncoming = type === 'incoming' || type === 'both';

  return (
    <div className="space-y-6">
      {/* 発リンク一覧 */}
      {showOutgoing && (
        <div>
          <h3 className="font-semibold mb-2">発リンク（この記事から他の記事へのリンク）</h3>
          {article.internalLinks && article.internalLinks.length > 0 ? (
            <ul className="space-y-3">
              {article.internalLinks.map((link, index) => (
                <li key={`outgoing-${index}`} className="border-b pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{link.anchorText || "リンクテキストなし"}</p>
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {link.linkUrl}
                      </a>
                    </div>
                    <Badge variant={link.isFollow ? "default" : "outline"}>
                      {link.isFollow ? "follow" : "nofollow"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">発リンクはありません</p>
          )}
        </div>
      )}

      {/* 被リンク一覧 */}
      {showIncoming && (
        <div>
          <h3 className="font-semibold mb-2">被リンク（他の記事からこの記事へのリンク）</h3>
          {article.linkedFrom && article.linkedFrom.length > 0 ? (
            <ul className="space-y-3">
              {article.linkedFrom.map((link, index) => {
                // criteriaArticleIdから記事情報を取得（実際の実装ではAPIなどから取得）
                const sourceArticleId = link.criteriaArticleId;
                return (
                  <li key={`incoming-${index}`} className="border-b pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          記事ID: {sourceArticleId} からのリンク
                        </p>
                        <p className="text-xs text-muted-foreground">
                          アンカーテキスト: {link.anchorText || "リンクテキストなし"}
                        </p>
                      </div>
                      <Badge variant={link.isFollow ? "default" : "outline"}>
                        {link.isFollow ? "follow" : "nofollow"}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">被リンクはありません</p>
          )}
        </div>
      )}
    </div>
  );
}
