import React, { Fragment, useState } from 'react'; // useState を追加
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table';
import type { Keyword } from '~/types/keyword';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react'; // アイコンをインポート
import { Badge } from "~/components/ui/badge"; // Badge をインポート

/**
 * null または undefined の値をハイフン '-' に変換するフォーマット関数
 */
const formatNullable = (value: string | number | null | undefined) => value ?? "-";

/**
 * 検索ボリュームを桁区切りでフォーマットする関数
 */
const formatSearchVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString();
}

/**
 * KeywordTreeTable コンポーネントの Props 定義
 */
interface KeywordTreeTableProps {
  /** 表示するキーワードデータの配列 (階層構造) */
  keywords: Keyword[];
  /** 編集ボタンクリック時のコールバック関数 */
  onEdit: (keyword: Keyword) => void;
  /** 削除ボタンクリック時のコールバック関数 */
  onDelete: (keywordId: number) => void;
  /** 行クリック時のコールバック関数 */
  onRowClick: (keyword: Keyword) => void; // 詳細表示用
}

/**
 * 階層構造を持つキーワードを表示するためのテーブルコンポーネント。
 * TanStack Table (react-table) v8 を使用。
 */
export default function KeywordTreeTable({
  keywords,
  onEdit,
  onDelete,
  onRowClick,
}: KeywordTreeTableProps) {
  // 列定義 (後で詳細を実装)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = React.useMemo<ColumnDef<Keyword, any>[]>(
    () => [
      {
        accessorKey: 'keywordName',
        header: 'キーワード名',
        cell: ({ row, getValue }) => (
          <div style={{ paddingLeft: `${row.depth * 1.5}rem` }} className="flex items-center">
            {/* 展開/折りたたみボタン (子がある場合のみ表示) */}
            {row.getCanExpand() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // 行クリックイベントの発火を防ぐ
                  row.toggleExpanded();
                }}
                className="h-6 w-6 p-1 mr-1"
              >
                {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            {/* キーワード名 */}
            <span className="truncate" title={getValue() as string}>
              {getValue() as string}
            </span>
          </div>
        ),
        size: 350, // 幅を指定
      },
      // --- ここから追加 ---
      {
        // accessorKey は不要かもしれませんが、一意なIDとして 'depth' を指定
        id: 'depth',
        header: '階層',
        // cell 関数で row オブジェクトを受け取る
        cell: ({ row }) => {
          // row.depth は 0 始まりなので +1 して表示
          const displayDepth = row.depth + 1;
          return (
            <Badge variant="secondary">階層{displayDepth}</Badge>
          );
        },
        size: 80,
      },
      // --- ここまで追加 ---
      {
        accessorKey: 'searchVolume',
        header: () => <div className="text-right">検索Vol.</div>,
        cell: ({ getValue }) => <div className="text-right">{formatSearchVolume(getValue() as number)}</div>,
        size: 100,
      },
      {
        accessorKey: 'difficulty',
        header: '難易度',
        cell: ({ getValue }) => {
          const difficulty = getValue() as Keyword['difficulty'];
          return difficulty ? (
            <Badge variant={
              difficulty === '高' ? 'destructive' :
                difficulty === '中' ? 'secondary' :
                  'outline'
            }>
              {formatNullable(difficulty)}
            </Badge>
          ) : formatNullable(difficulty);
        },
        size: 80,
      },
      {
        accessorKey: 'relevance',
        header: '関連度',
        cell: ({ getValue }) => formatNullable(getValue() as string | number),
        size: 80,
      },
      {
        accessorKey: 'searchIntent',
        header: '検索意図',
        cell: ({ getValue }) => formatNullable(getValue() as string),
        size: 100,
      },
      {
        accessorKey: 'importance',
        header: '重要度',
        cell: ({ getValue }) => {
          const importance = getValue() as Keyword['importance'];
          return importance ? (
            <Badge variant={
              importance === '高' ? 'default' :
                importance === '中' ? 'secondary' :
                  'outline'
            }>
              {formatNullable(importance)}
            </Badge>
          ) : formatNullable(importance);
        },
        size: 80,
      },
      {
        accessorKey: 'memo',
        header: 'メモ',
        cell: ({ getValue }) => <div className="truncate" title={getValue() as string ?? ""}>{formatNullable(getValue() as string)}</div>,
        size: 150, // min-w-[150px] の代わりに size を使う
        // flex-1 のような挙動は size 指定では難しいので、最後の列で調整するか、CSSで対応
      },
      {
        id: 'actions',
        header: () => <div className="text-right">操作</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">操作メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(row.original); }}>
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(row.original.id); }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                >
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 50,
      },
    ],
    [onEdit, onDelete] // 依存配列にコールバック関数を追加
  );

  // テーブルインスタンスの作成
  const table = useReactTable({
    data: keywords, // loader から渡された階層データ
    columns,
    state: {
      // expanded: expanded, // 展開状態を state で管理する場合
    },
    // onExpandedChange: setExpanded, // 展開状態を state で管理する場合
    getSubRows: (row) => row.childKeywords, // 子行を取得する関数
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // 展開モデルを有効化
    initialState: {
      expanded: true, // 初期状態で全展開
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined, minWidth: header.getSize() === 150 ? '150px' : undefined }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick(row.original)} // 行クリックイベント
                className="cursor-pointer hover:bg-muted/50" // クリック可能を示すスタイル
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined, minWidth: cell.column.getSize() === 150 ? '150px' : undefined }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                キーワードが登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
