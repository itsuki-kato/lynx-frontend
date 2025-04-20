import type { ArticleItem, OuterLinkItem } from "~/types/article";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Card コンポーネントをインポート

interface Props {
  item: ArticleItem;
}

export function ScrapingResultOuterLinks({ item }: Props) {
  return (
    <Card> {/* div を Card に変更 */}
      <CardHeader className="flex flex-row items-center space-x-2 py-3"> {/* CardHeader を使用し、スタイル調整 */}
        <ExternalLink className="h-5 w-5 text-muted-foreground" /> {/* text-muted-foreground を使用 */}
        <CardTitle className="text-lg font-medium">外部リンク</CardTitle> {/* CardTitle を使用 */}
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* CardContent を使用し、padding調整 */}
        {item.outerLinks && item.outerLinks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>外部リンク一覧 - 合計: {item.outerLinks.length}件</TableCaption>
              <TableHeader> {/* 背景色クラスを削除 */}
                <TableRow>
                  <TableHead className="text-xs uppercase">アンカーテキスト</TableHead>
                  <TableHead className="text-xs uppercase">リンクURL</TableHead>
                  <TableHead className="text-xs uppercase">rel</TableHead>
                  <TableHead className="text-xs uppercase">ステータス</TableHead>
                  <TableHead className="text-xs uppercase">リダイレクト先</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.outerLinks.map((link: OuterLinkItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium break-all overflow-wrap-anywhere max-w-[200px]">
                      {link.anchorText || "（アンカーテキストなし）"}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all overflow-wrap-anywhere flex items-center gap-1"
                      >
                        <span className="break-all overflow-wrap-anywhere">{link.linkUrl}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {/* Badge からカスタムクラスを削除 */}
                      <Badge 
                        variant={link.isFollow !== undefined 
                          ? (link.isFollow ? "default" : "destructive") 
                          : "outline"
                        }
                      >
                        {link.isFollow !== undefined ? (link.isFollow ? 'follow' : 'nofollow') : '不明'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {link.status ? (
                        /* Badge からカスタムクラスを削除 */
                        <Badge 
                          variant={
                            link.status.code === 200 
                              ? "default" 
                              : link.status.code === 301 || link.status.code === 302
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {link.status.code}
                        </Badge>
                      ) : "不明"}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {link.status && link.status.redirectUrl ? (
                        <a
                          href={link.status.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all overflow-wrap-anywhere flex items-center gap-1"
                        >
                          <span className="break-all overflow-wrap-anywhere">{link.status.redirectUrl}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground"> {/* text-muted-foreground を使用 */}
            外部リンクがありません
          </div>
        )}
      </CardContent>
    </Card>
  );
}
