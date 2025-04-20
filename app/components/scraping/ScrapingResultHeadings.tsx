import type { ArticleItem } from "~/types/article";
import { HeadingList } from "./HeadingList";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Card コンポーネントをインポート

interface Props {
  item: ArticleItem;
}

export function ScrapingResultHeadings({ item }: Props) {
  return (
    <Card> {/* div を Card に変更 */}
      <CardHeader className="flex flex-row items-center space-x-2 py-3"> {/* CardHeader を使用し、スタイル調整 */}
        <div className="flex items-center text-muted-foreground"> {/* text-muted-foreground を使用 */}
          <Heading1 className="h-5 w-5" />
          <Heading2 className="h-4 w-4 -ml-1" />
          <Heading3 className="h-3 w-3 -ml-1" />
        </div>
        <CardTitle className="text-lg font-medium">見出し構造</CardTitle> {/* CardTitle を使用 */}
      </CardHeader>
      <CardContent className="p-4 pt-0"> {/* CardContent を使用し、padding調整 */}
        {item.headings && item.headings.length > 0 ? (
          <HeadingList headings={item.headings} />
        ) : (
          <div className="text-center py-4 text-muted-foreground"> {/* text-muted-foreground を使用 */}
            見出しがありません
          </div>
        )}
      </CardContent>
    </Card>
  );
}
