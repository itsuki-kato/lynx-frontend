import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
// Accordionコンポーネントをインポート
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
// MoreHorizontal のみ使用
import { MoreHorizontal } from "lucide-react";
import type { Keyword } from "~/types/keyword";
// HierarchicalKeyword は不要になったので削除
import { Badge } from "~/components/ui/badge";
import React from "react"; // Fragment を使うためにインポート

interface KeywordTableProps {
  keywords: Keyword[]; // 型を Keyword[] に戻す
  onEdit: (keyword: Keyword) => void;
  onDelete: (keywordId: number) => void;
}

// 各カラムの表示内容を整形するヘルパー関数
const formatNullable = (value: string | number | null | undefined) => value ?? "-";
const formatSearchVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString(); // 桁区切り
}

// 子キーワードを表示するためのコンポーネント（AccordionContent内で使用）
const ChildKeywordRow: React.FC<{
  keyword: Keyword;
  level: number; // インデント用
  onEdit: (keyword: Keyword) => void;
  onDelete: (keywordId: number) => void;
}> = ({ keyword, level, onEdit, onDelete }) => {
  return (
    <div className="flex items-center border-t py-2 px-4" style={{ paddingLeft: `${level * 1.5 + 1}rem` }}> {/* インデント + 基本パディング */}
      {/* 各セルをdivで表現 */}
      <div className="w-[350px] font-medium pr-4 truncate" title={keyword.keywordName}> {/* 幅とpadding調整 */}
        {keyword.keywordName}
      </div>
      <div className="w-[100px] text-right pr-4">{formatSearchVolume(keyword.searchVolume)}</div> {/* 幅調整 */}
      <div className="w-[80px] pr-4"> {/* 幅調整 */}
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
      </div>
      <div className="w-[80px] pr-4">{formatNullable(keyword.relevance)}</div> {/* 幅調整 */}
      <div className="w-[100px] pr-4">{formatNullable(keyword.searchIntent)}</div> {/* 幅調整 */}
      <div className="w-[80px] pr-4"> {/* 幅調整 */}
        {keyword.importance && (
           <Badge variant={
            keyword.importance === '高' ? 'default' :
            keyword.importance === '中' ? 'secondary' :
            'outline'
          }>
            {formatNullable(keyword.importance)}
          </Badge>
        )}
        {!keyword.importance && formatNullable(keyword.importance)}
      </div>
      <div className="flex-1 min-w-[150px] pr-4 truncate" title={keyword.memo ?? ""}> {/* 残りの幅、最小幅 */}
        {formatNullable(keyword.memo)}
      </div>
      <div className="w-[50px] text-right">
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
      </div>
    </div>
  );
};

// 再帰的に子キーワード行をレンダリングする関数
const renderChildKeywords = (
  keywords: Keyword[],
  level: number,
  onEdit: (keyword: Keyword) => void,
  onDelete: (keywordId: number) => void
): React.ReactNode => {
  return keywords.map((child) => (
    <React.Fragment key={child.id}>
      <ChildKeywordRow
        keyword={child}
        level={level}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {/* さらに子があれば再帰的に表示 */}
      {child.childKeywords && child.childKeywords.length > 0 && (
        renderChildKeywords(child.childKeywords, level + 1, onEdit, onDelete)
      )}
    </React.Fragment>
  ));
};


export default function KeywordTable({ keywords, onEdit, onDelete }: KeywordTableProps) {
  // トップレベルのキーワードのみをフィルタリング
  const topLevelKeywords = keywords.filter(k => k.parentId === null);

  return (
    <div className="rounded-md border">
      {/* テーブルヘッダーはAccordionの外に表示 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">キーワード名</TableHead>
            <TableHead className="w-[100px] text-right">検索Vol.</TableHead> {/* 幅調整 */}
            <TableHead className="w-[80px]">難易度</TableHead> {/* 幅調整 */}
            <TableHead className="w-[80px]">関連度</TableHead> {/* 幅調整 */}
            <TableHead className="w-[100px]">検索意図</TableHead> {/* 幅調整 */}
            <TableHead className="w-[80px]">重要度</TableHead> {/* 幅調整 */}
            <TableHead className="flex-1 min-w-[150px]">メモ</TableHead> {/* 残りの幅、最小幅 */}
            <TableHead className="w-[50px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* キーワードデータはAccordionで表示 */}
      {topLevelKeywords && topLevelKeywords.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {topLevelKeywords.map((keyword) => (
            <AccordionItem value={`keyword-${keyword.id}`} key={keyword.id} className="border-b">
              {/* AccordionTrigger 内にテーブル行のようなレイアウトを作成 */}
              <AccordionTrigger className="hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                {/* Trigger内はTableRowではなくdiv等でレイアウト */}
                <div className="flex items-center w-full px-4 py-2 text-sm"> {/* TableRowの代わりにflexコンテナ */}
                   <div className="w-[350px] font-medium text-left pr-4 truncate" title={keyword.keywordName}>{keyword.keywordName}</div> {/* text-left追加 */}
                   <div className="w-[100px] text-right pr-4">{formatSearchVolume(keyword.searchVolume)}</div>
                   <div className="w-[80px] pr-4">
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
                   </div>
                   <div className="w-[80px] pr-4">{formatNullable(keyword.relevance)}</div>
                   <div className="w-[100px] pr-4">{formatNullable(keyword.searchIntent)}</div>
                   <div className="w-[80px] pr-4">
                     {keyword.importance && (
                        <Badge variant={
                         keyword.importance === '高' ? 'default' :
                         keyword.importance === '中' ? 'secondary' :
                         'outline'
                       }>
                         {formatNullable(keyword.importance)}
                       </Badge>
                     )}
                     {!keyword.importance && formatNullable(keyword.importance)}
                   </div>
                   <div className="flex-1 min-w-[150px] pr-4 text-left truncate" title={keyword.memo ?? ""}>{formatNullable(keyword.memo)}</div> {/* text-left追加 */}
                   <div className="w-[50px] text-right flex justify-end"> {/* flexとjustify-endで右寄せ */}
                     {/* ドロップダウンメニューをTriggerの外に出さないように注意 */}
                     <DropdownMenu>
                       {/* asChildを削除 */}
                       <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} > {/* イベント伝播を停止 */}
                         <Button variant="ghost" className="h-8 w-8 p-0">
                           <span className="sr-only">操作メニューを開く</span>
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(keyword); }}> {/* イベント伝播を停止 */}
                           編集
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={(e) => { e.stopPropagation(); onDelete(keyword.id); }} /* イベント伝播を停止 */
                           className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                         >
                           削除
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* 子キーワードが存在する場合、再帰的にレンダリング */}
                {keyword.childKeywords && keyword.childKeywords.length > 0 ? (
                  renderChildKeywords(keyword.childKeywords, 1, onEdit, onDelete) // level 1 から開始
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground" style={{ paddingLeft: `${1 * 1.5 + 1}rem` }}>子キーワードはありません。</div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        // キーワードがない場合の表示（Table内に戻す）
        <Table>
          <TableBody>
             <TableRow>
               <TableCell colSpan={8} className="h-24 text-center">
                 キーワードが登録されていません。
               </TableCell>
             </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}
