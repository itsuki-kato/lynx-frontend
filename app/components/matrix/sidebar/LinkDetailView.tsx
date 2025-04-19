import type { ArticleItem } from '~/types/article';
import { ExternalLink, ArrowRight } from "lucide-react";

interface LinkDetail {
  source: ArticleItem;
  target: ArticleItem;
}

interface LinkDetailViewProps {
  linkDetail: LinkDetail;
}

/**
 * リンクのアンカーテキストを取得するヘルパー関数
 */
const getAnchorText = (sourceArticle: ArticleItem, targetUrl: string): string | null => {
  if (!sourceArticle || !targetUrl) return null;

  const link = sourceArticle.internalLinks?.find(l => {
    try {
      const linkUrl = new URL(l.linkUrl);
      const target = new URL(targetUrl);
      const normalizedLinkUrl = `${linkUrl.origin}${linkUrl.pathname}`.replace(/\/$/, '');
      const normalizedTargetUrl = `${target.origin}${target.pathname}`.replace(/\/$/, '');
      return normalizedLinkUrl === normalizedTargetUrl;
    } catch {
      return l.linkUrl === targetUrl;
    }
  });
  return link?.anchorText || "リンクテキストなし";
};

/**
 * リンク詳細を表示するコンポーネント
 */
export function LinkDetailView({ linkDetail }: LinkDetailViewProps) {
  const { source, target } = linkDetail;
  const anchorText = getAnchorText(source, target.articleUrl);

  return (
    <div className="px-6 py-4 space-y-6">
      {/* リンク元記事情報 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">発リンク元</span>
          {source.metaTitle}
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{source.metaDescription}</p>
          <a
            href={source.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {source.articleUrl}
          </a>
        </div>
      </div>

      {/* リンク情報 */}
      <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-3">リンク情報</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">アンカーテキスト: </span>
            <span className="text-sm">
              {anchorText}
            </span>
          </div>
          <div className="flex justify-center my-4">
            <div className="flex items-center">
              <div className="w-24 text-center text-xs">
                {source.metaTitle.length > 20
                  ? source.metaTitle.substring(0, 20) + '...'
                  : source.metaTitle}
              </div>
              <ArrowRight className="h-5 w-5 mx-2 text-blue-500" />
              <div className="w-24 text-center text-xs">
                {target.metaTitle.length > 20
                  ? target.metaTitle.substring(0, 20) + '...'
                  : target.metaTitle}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* リンク先記事情報 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">被リンク先</span>
          {target.metaTitle}
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{target.metaDescription}</p>
          <a
            href={target.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {target.articleUrl}
          </a>
        </div>
      </div>

      {/* SEO的な提案 */}
      <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-3">SEO提案</h3>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>アンカーテキストには、リンク先の記事内容を適切に表す言葉を使用することをお勧めします。</li>
          {!anchorText || anchorText === "リンクテキストなし" ? (
            <li className="text-amber-600">アンカーテキストが設定されていません。SEO効果を高めるためにも、適切なアンカーテキストを設定してください。</li>
          ) : anchorText.length < 3 ? (
            <li className="text-amber-600">アンカーテキストが短すぎます。もう少し具体的な内容を含めると良いでしょう。</li>
          ) : anchorText.length > 50 ? (
            <li className="text-amber-600">アンカーテキストが長すぎます。簡潔で具体的な内容に絞ると良いでしょう。</li>
          ) : (
            <li className="text-emerald-600">アンカーテキストの長さは適切です。</li>
          )}
          {source.internalLinks && source.internalLinks.length > 10 ? (
            <li className="text-amber-600">発リンク元の記事には多くの内部リンクがあります。重要なリンクが埋もれないよう、適切な数に調整することを検討してください。</li>
          ) : (
            <li className="text-emerald-600">発リンク元の記事の内部リンク数は適切です。</li>
          )}
        </ul>
      </div>
    </div>
  );
}
