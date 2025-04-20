import { Card, CardContent } from "~/components/ui/card"; // Card コンポーネントをインポート
import { Inbox } from "lucide-react"; // lucide-react アイコンをインポート

export function ScrapingEmptyState() {
  return (
    <Card className="p-8 text-center animate-fade-in"> {/* Card コンポーネントを使用 */}
      <CardContent className="flex flex-col items-center"> {/* CardContent を使用し、中央揃え */}
        <Inbox className="h-16 w-16 mx-auto text-muted-foreground" /> {/* lucide-react アイコンに変更、色を調整 */}
        <h3 className="mt-4 text-lg font-medium"> {/* text-gray-900 dark:text-white を削除 */}
          スクレイピング結果がありません
        </h3>
        <p className="mt-2 text-sm text-muted-foreground"> {/* text-gray-500 dark:text-gray-400 を text-muted-foreground に変更 */}
          スクレイピング画面から新しいURLをスクレイピングしてください
        </p>
      </CardContent>
    </Card>
  );
}
