import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ArticleItem } from '~/types/article';

interface MatrixSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: "all" | "hasLinks" | "noLinks" | "isolated" | "needsIncoming" | "needsOutgoing";
  setFilterType: (type: "all" | "hasLinks" | "noLinks" | "isolated" | "needsIncoming" | "needsOutgoing") => void;
  articles: ArticleItem[];
  filteredArticles: ArticleItem[];
}

/**
 * 内部リンクマトリクスの検索・フィルター用コンポーネント
 * 常に画面上部に固定表示される
 */
export default function MatrixSearchFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  articles,
  filteredArticles
}: MatrixSearchFilterProps) {
  // 孤立記事の数をカウント
  const isolatedCount = articles.filter(article => 
    (article.internalLinks?.length || 0) === 0 && 
    (article.linkedFrom?.length || 0) === 0
  ).length;

  // 発リンクがない記事の数をカウント
  const needsOutgoingCount = articles.filter(article => 
    (article.internalLinks?.length || 0) === 0 && 
    (article.linkedFrom?.length || 0) > 0
  ).length;

  // 被リンクがない記事の数をカウント
  const needsIncomingCount = articles.filter(article => 
    (article.internalLinks?.length || 0) > 0 && 
    (article.linkedFrom?.length || 0) === 0
  ).length;

  // フィルタータイプに応じたラベルを取得
  const getFilterLabel = () => {
    switch (filterType) {
      case "all": return "すべての記事";
      case "hasLinks": return "リンクあり";
      case "noLinks": return "リンクなし";
      case "isolated": return "孤立記事";
      case "needsIncoming": return "被リンクなし";
      case "needsOutgoing": return "発リンクなし";
      default: return "フィルター";
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 w-full border-b border-border/40 shadow-sm overflow-x-hidden">
      <div className="container flex flex-col gap-4 py-4 max-w-full">
        {/* 検索ボックス */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="タイトル、URL、説明で検索..."
            className="w-full pl-10 pr-10 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSearchTerm("")}
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* フィルターとカウント表示 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* フィルタードロップダウン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4 mr-1" />
                {getFilterLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>記事フィルター</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  <span className={filterType === "all" ? "font-medium" : ""}>すべての記事</span>
                  <Badge variant="outline" className="ml-auto">{articles.length}</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("hasLinks")}>
                  <span className={filterType === "hasLinks" ? "font-medium" : ""}>リンクあり</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("noLinks")}>
                  <span className={filterType === "noLinks" ? "font-medium" : ""}>リンクなし</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>SEO改善候補</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setFilterType("isolated")}>
                  <span className={filterType === "isolated" ? "font-medium" : ""}>孤立記事</span>
                  {isolatedCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">{isolatedCount}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("needsIncoming")}>
                  <span className={filterType === "needsIncoming" ? "font-medium" : ""}>被リンクなし</span>
                  {needsIncomingCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">{needsIncomingCount}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("needsOutgoing")}>
                  <span className={filterType === "needsOutgoing" ? "font-medium" : ""}>発リンクなし</span>
                  {needsOutgoingCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">{needsOutgoingCount}</Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 検索結果カウント表示 */}
          {(searchTerm || filterType !== "all") && (
            <div className="text-sm text-muted-foreground">
              検索結果: <span className="font-medium">{filteredArticles.length}</span> / {articles.length} 件
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
