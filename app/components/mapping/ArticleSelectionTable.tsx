import type { ArticleItem } from '~/types/article';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from '~/components/ui/scroll-area';
import { Input } from "~/components/ui/input";
import { Search, XCircle } from 'lucide-react';

interface ArticleSelectionTableProps {
  articles: ArticleItem[];
  selectedArticleIds: Set<string | number>;
  onArticleSelect: (articleId: string | number) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  height?: string; // Optional height for the scroll area
}

export default function ArticleSelectionTable({
  articles,
  selectedArticleIds,
  onArticleSelect,
  searchTerm,
  onSearchTermChange,
  height = "h-[500px]" // Default height
}: ArticleSelectionTableProps) {
  const filteredArticles = articles.filter(article =>
    article.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.articleUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="記事を検索 (タイトル, URL, 概要)..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
      {filteredArticles.length > 0 ? (
        <ScrollArea className={height}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">選択</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>概要</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow
                  key={article.id}
                  onClick={() => onArticleSelect(article.id!)}
                  className="cursor-pointer"
                  data-state={selectedArticleIds.has(article.id!) ? 'selected' : ''}
                >
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-3 px-4">
                    <Checkbox
                      checked={selectedArticleIds.has(article.id!)}
                      onCheckedChange={() => onArticleSelect(article.id!)}
                      aria-label={`記事「${article.metaTitle}」を選択`}
                    />
                  </TableCell>
                  <TableCell className="font-medium line-clamp-2 py-6 px-4">{article.metaTitle || 'タイトルなし'}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs py-6 px-4">{article.articleUrl}</TableCell>
                  <TableCell className="text-muted-foreground line-clamp-2 py-6 px-4">{article.metaDescription || '概要なし'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <div className={`flex flex-col items-center justify-center ${height} text-muted-foreground`}>
          <XCircle size={48} className="mb-2 opacity-50" />
          <p>該当する記事が見つかりません</p>
        </div>
      )}
    </div>
  );
}
