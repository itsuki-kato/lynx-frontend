import type { ArticleItem } from "~/types/article";
import { Info } from "lucide-react"; // FileText, Globe は未使用なので削除
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Card コンポーネントをインポート

interface Props {
  item: ArticleItem;
}

export function ScrapingResultBasicInfo({ item }: Props) {
  return (
    <Card> {/* div を Card に変更 */}
      <CardHeader className="flex flex-row items-center space-x-2 py-3"> {/* CardHeader を使用し、スタイル調整 */}
        <Info className="h-5 w-5 text-muted-foreground" /> {/* text-muted-foreground を使用 */}
        <CardTitle className="text-lg font-medium">基本情報</CardTitle> {/* CardTitle を使用 */}
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* CardContent を使用し、padding調整 */}
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {/* URL */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">URL</dt> {/* text-muted-foreground を使用 */}
            <dd className="mt-1 text-sm break-all overflow-wrap-anywhere">
              <a
                href={item.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all overflow-wrap-anywhere"
              >
                {item.articleUrl}
              </a>
            </dd>
          </div>

          {/* タイトル */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">タイトル</dt> {/* text-muted-foreground を使用 */}
            <dd className="mt-1 text-sm break-words">
              {item.metaTitle || "タイトルなし"}
            </dd>
          </div>

          {/* 説明文 */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">説明文（メタディスクリプション）</dt> {/* text-muted-foreground を使用 */}
            <dd className="mt-1 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {item.metaDescription || "説明文なし"}
            </dd>
          </div>

          {/* インデックス状態 */}
          <div>
            <dt className="text-sm font-medium text-muted-foreground">インデックス状態</dt> {/* text-muted-foreground を使用 */}
            <dd className="mt-1">
              {/* Badge からカスタムクラスを削除 */}
              <Badge variant={item.isIndexable ? "default" : "destructive"}>
                {item.isIndexable ? 'インデックス' : 'ノーインデックス'}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
