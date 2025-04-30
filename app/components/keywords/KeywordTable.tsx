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
import { MoreHorizontal, CornerDownRight } from "lucide-react"; // CornerDownRight を追加
import type { Keyword } from "~/types/keyword";
import type { HierarchicalKeyword } from "~/utils/keyword-utils"; // 階層型をインポート
import { Badge } from "~/components/ui/badge";
import React from "react"; // Fragment を使うためにインポート

interface KeywordTableProps {
  keywords: HierarchicalKeyword[]; // 型を階層型に変更
  onEdit: (keyword: Keyword) => void;
  onDelete: (keywordId: number) => void;
}

// 各カラムの表示内容を整形するヘルパー関数
const formatNullable = (value: string | number | null | undefined) => value ?? "-";
const formatSearchVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString(); // 桁区切り
}

// 再帰的にテーブル行をレンダリングするコンポーネント
const KeywordTableRow: React.FC<{
  keyword: HierarchicalKeyword;
  level: number; // level を直接渡す
  onEdit: (keyword: Keyword) => void; // Keyword 型で受け取る
  onDelete: (keywordId: number) => void;
}> = ({ keyword, level, onEdit, onDelete }) => {
  // HierarchicalKeyword から Keyword 型に必要なプロパティを抽出
  const plainKeyword: Keyword = {
    id: keyword.id,
    projectId: keyword.projectId,
    keywordName: keyword.keywordName,
    parentId: keyword.parentId,
    level: keyword.level, // level は HierarchicalKeyword にもある
    searchVolume: keyword.searchVolume,
    difficulty: keyword.difficulty,
    relevance: keyword.relevance,
    searchIntent: keyword.searchIntent,
    importance: keyword.importance,
    memo: keyword.memo,
    createdAt: keyword.createdAt,
    updatedAt: keyword.updatedAt,
  };

  return (
    <React.Fragment>
      <TableRow key={keyword.id}>
        {/* キーワード名にインデントを追加 */}
        <TableCell className="font-medium" style={{ paddingLeft: `${level * 1.5}rem` }}>
          {level > 1 && <CornerDownRight className="inline-block h-4 w-4 mr-1 text-muted-foreground" />}
          {keyword.keywordName}
        </TableCell>
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
              {/* onEdit には plainKeyword を渡す */}
              <DropdownMenuItem onClick={() => onEdit(plainKeyword)}>
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
      {/* 子要素が存在する場合、再帰的にレンダリング */}
      {keyword.children && keyword.children.length > 0 && (
        keyword.children.map(child => (
          <KeywordTableRow
            key={child.id}
            keyword={child}
            level={level + 1} // 子のレベルは +1
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </React.Fragment>
  );
};


export default function KeywordTable({ keywords, onEdit, onDelete }: KeywordTableProps) {
  // 各カラムの表示内容を整形するヘルパー関数など（必要に応じて）
  // const formatNullable = (value: string | number | null | undefined) => value ?? "-"; // 上に移動
  // const formatSearchVolume = (value: number | null | undefined) => { // 上に移動
  // } // 上に移動

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* キーワード名の幅を少し広げる */}
            <TableHead className="w-[350px]">キーワード名</TableHead>
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
            // トップレベルのキーワードを KeywordTableRow でレンダリング
            keywords.map((keyword) => (
              <KeywordTableRow
                key={keyword.id}
                keyword={keyword}
                level={1} // トップレベルは 1
                onEdit={onEdit}
                onDelete={onDelete}
              />
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
