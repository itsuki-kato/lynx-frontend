import type { ArticleItem } from "~/types/article";
import { ExternalLink, ArrowRight, Link, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
    <div className="space-y-4 p-4">
      {/* リンク元記事情報 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Badge variant="outline" className="mb-3 border-blue-500 text-blue-500 inline-flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              発リンク元
            </Badge>
            <div>{source.metaTitle}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
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
        </CardContent>
      </Card>

      {/* リンク先記事情報 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Badge variant="outline" className="mb-3 border-green-500 text-green-500 inline-flex items-center">
              <ArrowRight className="h-4 w-4 mr-2" />
              被リンク先
            </Badge>
            <div>{target.metaTitle}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
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
        </CardContent>
      </Card>

      {/* リンク情報 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Badge variant="outline" className="mb-3 border-amber-500 text-amber-500 inline-flex items-center">
              <Link className="h-4 w-4 mr-2" />
              リンクテキスト
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-3 bg-muted/40 flex items-center">
            <Link className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="text-sm break-all">{anchorText}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
