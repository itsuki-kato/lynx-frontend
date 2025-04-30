import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Keyword } from "~/types/keyword";
import { Badge } from "~/components/ui/badge"; // Badgeを追加

interface KeywordTableProps {
  keywords: Keyword[];
  onEdit: (keyword: Keyword) => void;
  onDelete: (keywordId: number) => void;
}

export default function KeywordTable({ keywords, onEdit, onDelete }: KeywordTableProps) {
  // 各カラムの表示内容を整形するヘルパー関数など（必要に応じて）
  const formatNullable = (value: string | number | null | undefined) => value ?? "-";
  const formatSearchVolume = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString(); // 桁区切り
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">キーワード名</TableHead>
            <TableHead className="text-right">検索Vol.</TableHead>
            <TableHead>難易度</TableHead>
            <TableHead>関連度</TableHead>
            <TableHead>検索意図</TableHead>
            <TableHead>重要度</TableHead>
            <TableHead>メモ</TableHead>
            <TableHead className="w-[50px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords && keywords.length > 0 ? (
            keywords.map((keyword) => (
              <TableRow key={keyword.id}>
                <TableCell className="font-medium">{keyword.keywordName}</TableCell>
                <TableCell className="text-right">{formatSearchVolume(keyword.searchVolume)}</TableCell>
                <TableCell>
                  {/* 難易度に応じてBadgeの色を変える例 */}
                  {keyword.difficulty && (
                    <Badge variant={
                      keyword.difficulty === '高' ? 'destructive' :
                      keyword.difficulty === '中' ? 'secondary' :
                      'outline'
                    }>
                      {formatNullable(keyword.difficulty)}
                    </Badge>
                  )}
                  {!keyword.difficulty && formatNullable(keyword.difficulty)}
                </TableCell>
                <TableCell>{formatNullable(keyword.relevance)}</TableCell>
                <TableCell>{formatNullable(keyword.searchIntent)}</TableCell>
                <TableCell>
                  {/* 重要度に応じてBadgeの色を変える例 */}
                  {keyword.importance && (
                     <Badge variant={
                      keyword.importance === '高' ? 'default' : // 'default' は primary color
                      keyword.importance === '中' ? 'secondary' :
                      'outline'
                    }>
                      {formatNullable(keyword.importance)}
                    </Badge>
                  )}
                  {!keyword.importance && formatNullable(keyword.importance)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={keyword.memo ?? ""}>
                  {formatNullable(keyword.memo)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">操作メニューを開く</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(keyword)}>
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(keyword.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                キーワードが登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
