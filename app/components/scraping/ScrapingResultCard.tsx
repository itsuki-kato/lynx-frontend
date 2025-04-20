import type { ArticleItem } from "~/atoms/articles"; // 正しい型とパスに修正
import { getInternalLinksCount } from "~/utils/scraping-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"; // Card コンポーネントをインポート
import { Badge } from "~/components/ui/badge"; // Badge コンポーネントをインポート

interface ScrapingResultCardProps {
  item: ArticleItem; // 型名を修正
  onClick: () => void;
}

export function ScrapingResultCard({ item, onClick }: ScrapingResultCardProps) {
  const internalLinksCount = getInternalLinksCount(item);

  return (
    <Card
      className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3"> {/* Padding を調整 */}
        <CardTitle className="text-lg line-clamp-2"> {/* text-lg に変更 */}
          {item.title || "タイトルなし"}
        </CardTitle>
        <CardDescription className="pt-1"> {/* pt-1 を追加 */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block" // block を追加
            onClick={(e) => e.stopPropagation()} // カード全体のクリックイベントを防止
          >
            {item.url}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground line-clamp-4 h-20 overflow-hidden"> {/* text-muted-foreground を使用 */}
        {item.content || "コンテンツなし"}
      </CardContent>
      <CardFooter className="py-3 flex justify-between items-center"> {/* items-center を追加 */}
        <Badge variant={item.index_status === "index" ? "default" : "destructive"}>
          {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
        </Badge>
        {/* internal_links を参照するように修正 */}
        <span className="text-xs text-muted-foreground">
          {item.internal_links?.length || 0} リンク 
        </span>
      </CardFooter>
    </Card>
  );
}
