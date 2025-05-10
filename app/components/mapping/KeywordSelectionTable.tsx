import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { Keyword } from '~/types/keyword';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

interface KeywordSelectionTableProps {
  keywords: Keyword[];
  selectedKeywordIds: Set<number>;
  onKeywordSelect: (keyword: Keyword) => void; // 選択状態変更のコールバック
  searchTerm?: string; // 検索語句を追加
}

export default function KeywordSelectionTable({
  keywords,
  selectedKeywordIds,
  onKeywordSelect,
  searchTerm = '',
}: KeywordSelectionTableProps) {
  // 検索フィルター関数
  const filterKeywords = (data: Keyword[]) => {
    if (!searchTerm) return data;
    
    // 再帰的に検索する関数
    const searchInTree = (items: Keyword[]): Keyword[] => {
      return items.reduce<Keyword[]>((filtered, item) => {
        // このキーワードが検索条件に一致するか
        const matchesSearch = item.keywordName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 子キーワードを検索
        const filteredChildren = item.childKeywords ? searchInTree(item.childKeywords) : [];
        
        // このキーワードが条件に一致するか、子キーワードに一致するものがあれば含める
        if (matchesSearch || filteredChildren.length > 0) {
          const newItem = { ...item };
          if (filteredChildren.length > 0) {
            newItem.childKeywords = filteredChildren;
          }
          filtered.push(newItem);
        }
        
        return filtered;
      }, []);
    };
    
    return searchInTree(data);
  };

  // 検索条件に基づいてフィルタリングされたキーワード
  const filteredKeywords = useMemo(() => filterKeywords(keywords), [keywords, searchTerm]);

  const columns = useMemo<ColumnDef<Keyword, any>[]>(
    () => [
      {
        id: 'select',
        header: () => <div className="px-1">選択</div>,
        cell: ({ row }) => (
          <div className="px-1 flex justify-center">
            {selectedKeywordIds.has(row.original.id) ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
            )}
          </div>
        ),
        size: 60,
      },
      {
        accessorKey: 'keywordName',
        header: 'キーワード名',
        cell: ({ row, getValue }) => (
          <div style={{ paddingLeft: `${row.depth * 1.5}rem` }} className="flex items-center">
            {row.getCanExpand() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  row.toggleExpanded();
                }}
                className="h-6 w-6 p-1 mr-1"
              >
                {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            <span className="truncate font-medium" title={getValue() as string}>
              {getValue() as string}
            </span>
            {row.original.searchVolume && (
              <Badge variant="outline" className="ml-2 text-xs">
                {row.original.searchVolume.toLocaleString()}
              </Badge>
            )}
          </div>
        ),
      },
    ],
    [onKeywordSelect, selectedKeywordIds]
  );

  const table = useReactTable({
    data: filteredKeywords,
    columns,
    state: {
      // expanded: {}, // 必要に応じて外部から制御
    },
    getSubRows: (row) => row.childKeywords,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}>
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
                data-state={selectedKeywordIds.has(row.original.id) ? "selected" : ""}
                onClick={() => onKeywordSelect(row.original)} // 行クリックでも選択状態を変更
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedKeywordIds.has(row.original.id) && "bg-primary/10 dark:bg-primary/20"
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {searchTerm ? "検索条件に一致するキーワードがありません。" : "キーワードが登録されていません。"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
