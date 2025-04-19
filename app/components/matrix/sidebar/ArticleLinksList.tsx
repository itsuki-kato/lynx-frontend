import type { ArticleItem, InternalLinkItem } from '~/types/article'; // InternalLink -> InternalLinkItem, LinkedFrom を削除
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface ArticleLinksListProps {
  article: ArticleItem;
  articles: ArticleItem[]; // 全記事データを追加
  type: 'incoming' | 'outgoing' | 'both';
}

// URLを正規化するヘルパー関数（末尾のスラッシュを削除）
const normalizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // クエリパラメータやハッシュを除いたパスを返す
    return `${parsedUrl.origin}${parsedUrl.pathname}`.replace(/\/$/, '');
  } catch {
    // 不正なURLの場合はそのまま返す
    return url.replace(/\/$/, '');
  }
};


// 発リンクをリンク先URLでグルーピングする関数
const groupOutgoingLinks = (internalLinks: InternalLinkItem[] | undefined, allArticles: ArticleItem[], baseArticle: ArticleItem) => { // InternalLink -> InternalLinkItem
  if (!internalLinks) return {};
  // 基準となる記事のURLを正規化
  const normalizedBaseUrl = normalizeUrl(baseArticle.articleUrl);
  // リンク先URLをキーとしたRecord。値は記事情報、アンカーテキストのSet、follow状態
  const grouped: Record<string, { article: ArticleItem | undefined; anchorTexts: Set<string>; isFollow: boolean }> = {};

  internalLinks.forEach(link => {
    const normalizedLinkUrl = normalizeUrl(link.linkUrl);
    
    // 基準となる記事と同じURLの場合はスキップ
    if (normalizedLinkUrl === normalizedBaseUrl) return;
    
    // 全記事データからリンク先URLに一致する記事を検索
    const targetArticle = allArticles.find(a => normalizeUrl(a.articleUrl) === normalizedLinkUrl);

    if (!grouped[normalizedLinkUrl]) {
      grouped[normalizedLinkUrl] = {
        article: targetArticle, // 見つかった記事情報（なければundefined）
        anchorTexts: new Set(), // アンカーテキストを格納するSetを初期化
        isFollow: link.isFollow ?? true // 最初のリンクのfollow状態を代表とする（undefinedの場合はtrueとする）
      };
    }
    // アンカーテキストをSetに追加（重複は自動的に排除される）
    grouped[normalizedLinkUrl].anchorTexts.add(link.anchorText || 'リンクテキストなし');
    // isFollowの扱い：同じURLへのリンクが複数ある場合、一つでもnofollowがあればnofollowとする
    if (!link.isFollow) {
        grouped[normalizedLinkUrl].isFollow = false;
    }
  });
  return grouped;
};

// 被リンクをリンク元記事IDでグルーピングする関数
const groupIncomingLinks = (linkedFrom: InternalLinkItem[] | undefined, allArticles: ArticleItem[], baseArticle: ArticleItem) => { // LinkedFrom -> InternalLinkItem
  if (!linkedFrom) return {};
  // 基準となる記事のURLを正規化
  const normalizedBaseUrl = normalizeUrl(baseArticle.articleUrl);
  // リンク元記事ID（文字列化）をキーとしたRecord。値は記事情報、アンカーテキストのSet、follow状態
  const grouped: Record<string, { article: ArticleItem | undefined; anchorTexts: Set<string>; isFollow: boolean }> = {};

  linkedFrom.forEach(link => {
    // criteriaArticleId が undefined の場合はスキップ
    if (link.criteriaArticleId === undefined) return;

    const sourceArticleId = link.criteriaArticleId;
    // 全記事データからリンク元記事ID (link.criteriaArticleId) に一致する記事 (a.id) を検索
    // a.id は string | number なので、比較のために sourceArticleId を文字列に変換する
    const sourceArticle = allArticles.find(a => String(a.id) === String(sourceArticleId));
    
    // 基準となる記事と同じURLの場合はスキップ
    if (sourceArticle && normalizeUrl(sourceArticle.articleUrl) === normalizedBaseUrl) return;
    
    const sourceArticleIdStr = String(sourceArticleId); // グルーピングキーとして文字列を使用

    if (!grouped[sourceArticleIdStr]) {
      grouped[sourceArticleIdStr] = {
        article: sourceArticle, // 見つかった記事情報（なければundefined）
        anchorTexts: new Set(), // アンカーテキストを格納するSetを初期化
        isFollow: link.isFollow ?? true // 最初のリンクのfollow状態を代表とする（undefinedの場合はtrueとする）
      };
    }
     // アンカーテキストをSetに追加
    grouped[sourceArticleIdStr].anchorTexts.add(link.anchorText || 'リンクテキストなし');
    // isFollowの扱い：同じ記事からのリンクが複数ある場合、一つでもnofollowがあればnofollowとする
     if (!link.isFollow) {
        grouped[sourceArticleIdStr].isFollow = false;
    }
  });
  return grouped;
};


/**
 * 記事の内部リンク（発リンク・被リンク）を表示するコンポーネント
 * URL/記事IDでグルーピングし、タイトル、URL、アンカーテキストリストを表示
 * 基準となる記事と同じURLの内部リンクは表示しない
 */
export function ArticleLinksList({ article, articles, type }: ArticleLinksListProps) {
  const showOutgoing = type === 'outgoing' || type === 'both';
  const showIncoming = type === 'incoming' || type === 'both';

  // 発リンクデータをグルーピング（基準記事を渡して同じURLのリンクを除外）
  const groupedOutgoingLinks = showOutgoing ? groupOutgoingLinks(article.internalLinks, articles, article) : {};
  // 被リンクデータをグルーピング（基準記事を渡して同じURLのリンクを除外）
  const groupedIncomingLinks = showIncoming ? groupIncomingLinks(article.linkedFrom, articles, article) : {};

  return (
    <div className="space-y-6 p-4">
      {/* 発リンク一覧 */}
      {showOutgoing && (
        <div>
          <h3 className="font-semibold mb-3 text-lg">発リンク</h3>
          {Object.keys(groupedOutgoingLinks).length > 0 ? (
            <div className="space-y-4">
              {/* グルーピングされた発リンク情報をループ表示 */}
              {Object.entries(groupedOutgoingLinks).map(([url, data]) => (
                <Card key={`outgoing-${url}`}>
                  <CardHeader className="pb-2">
                    {/* リンク先記事のタイトル */}
                    <CardTitle className="text-base font-medium">
                      {data.article?.metaTitle || 'タイトル不明'}
                    </CardTitle>
                    {/* リンク先記事のURL */}
                     <a
                        href={data.article?.articleUrl || url} // 記事情報があればそのURL、なければグルーピングキーのURL
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all flex items-center pt-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                        {data.article?.articleUrl || url}
                      </a>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* アンカーテキストセクションヘッダーとFollow/Nofollowバッジ */}
                     <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">アンカーテキスト:</p>
                        <Badge variant={data.isFollow ? "default" : "outline"} className="ml-auto">
                            {data.isFollow ? "follow" : "nofollow"}
                        </Badge>
                     </div>
                     {/* アンカーテキストのリスト */}
                    <div className="flex flex-wrap gap-1">
                      {Array.from(data.anchorTexts).map((text, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {text}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">発リンクはありません</p>
          )}
        </div>
      )}

      {/* 被リンク一覧 */}
      {showIncoming && (
        <div>
          <h3 className="font-semibold mb-3 text-lg">被リンク</h3>
          {Object.keys(groupedIncomingLinks).length > 0 ? (
            <div className="space-y-4">
              {/* グルーピングされた被リンク情報をループ表示 */}
              {Object.entries(groupedIncomingLinks).map(([sourceId, data]) => (
                 <Card key={`incoming-${sourceId}`}>
                  <CardHeader className="pb-2">
                     {/* リンク元記事のタイトル */}
                    <CardTitle className="text-base font-medium">
                      {data.article?.metaTitle || `記事ID: ${sourceId} (タイトル不明)`}
                    </CardTitle>
                    {/* リンク元記事のURL */}
                     <a
                        href={data.article?.articleUrl || '#'} // 記事情報があればそのURL、なければ '#'
                        target="_blank"
                        rel="noopener noreferrer"
                        // URLが不明な場合はクリックできないようにスタイル調整
                        className={`text-xs text-blue-600 hover:underline break-all flex items-center pt-1 ${!data.article?.articleUrl ? 'pointer-events-none text-muted-foreground' : ''}`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                        {data.article?.articleUrl || 'URL不明'}
                      </a>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {/* アンカーテキストセクションヘッダーとFollow/Nofollowバッジ */}
                     <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">アンカーテキスト:</p>
                        <Badge variant={data.isFollow ? "default" : "outline"} className="ml-auto">
                            {data.isFollow ? "follow" : "nofollow"}
                        </Badge>
                     </div>
                     {/* アンカーテキストのリスト */}
                    <div className="flex flex-wrap gap-1">
                      {Array.from(data.anchorTexts).map((text, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                           <LinkIcon className="h-3 w-3 mr-1" />
                          {text}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">被リンクはありません</p>
          )}
        </div>
      )}
    </div>
  );
}
