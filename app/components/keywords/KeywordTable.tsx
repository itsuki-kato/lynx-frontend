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

/**
 * KeywordTable コンポーネントの Props 定義
 */
interface KeywordTableProps {
  /** 表示するキーワードデータの配列 (APIから取得した階層構造を想定) */
  keywords: Keyword[];
  /** 編集ボタンクリック時のコールバック関数 */
  onEdit: (keyword: Keyword) => void;
  /** 削除ボタンクリック時のコールバック関数 */
  onDelete: (keywordId: number) => void;
}

// --- Helper Functions ---

/**
 * null または undefined の値をハイフン '-' に変換するフォーマット関数
 * @param value 表示する値
 * @returns string | number
 */
const formatNullable = (value: string | number | null | undefined) => value ?? "-";

/**
 * 検索ボリュームを桁区切りでフォーマットする関数
 * null または undefined の場合はハイフン '-' を返す
 * @param value 検索ボリューム
 * @returns string
 */
const formatSearchVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString(); // 3桁区切りにする
}

// --- Child Keyword Rendering Components ---

/**
 * 子キーワード行を表示するための内部コンポーネント。
 * AccordionContent 内で再帰的に使用される。
 * level に応じてインデントを適用する。
 */
const ChildKeywordRow: React.FC<{
  /** 表示するキーワードデータ */
  keyword: Keyword;
  /** 階層レベル (インデント計算用) */
  level: number;
  /** 編集ボタンクリック時のコールバック */
  onEdit: (keyword: Keyword) => void;
  /** 削除ボタンクリック時のコールバック */
  onDelete: (keywordId: number) => void;
}> = ({ keyword, level, onEdit, onDelete }) => {
  // インデントスタイルを計算 (level 1 がベース)
  const indentStyle = { paddingLeft: `${level * 1.5 + 1}rem` }; // level * 1.5rem + 基本パディング 1rem

  return (
    <div className="flex items-center border-t py-2 px-4" style={indentStyle}>
      {/* 各セルを div で表現し、TableHeader の幅と合わせる */}
      <div className="w-[350px] font-medium pr-4 truncate" title={keyword.keywordName}>
        {keyword.keywordName}
      </div>
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
        {!keyword.difficulty && formatNullable(keyword.difficulty)} {/* Badge がない場合はそのまま表示 */}
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
        {!keyword.importance && formatNullable(keyword.importance)} {/* Badge がない場合はそのまま表示 */}
      </div>
      <div className="flex-1 min-w-[150px] pr-4 truncate" title={keyword.memo ?? ""}>
        {formatNullable(keyword.memo)}
      </div>
      {/* 操作メニュー */}
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

/**
 * 子キーワードの配列を受け取り、ChildKeywordRow コンポーネントを再帰的にレンダリングする関数。
 * @param keywords 表示する子キーワードの配列
 * @param level 現在の階層レベル
 * @param onEdit 編集コールバック
 * @param onDelete 削除コールバック
 * @returns React ノードの配列
 */
const renderChildKeywords = (
  keywords: Keyword[],
  level: number,
  onEdit: (keyword: Keyword) => void,
  onDelete: (keywordId: number) => void
): React.ReactNode => {
  return keywords.map((child) => (
    // 各子キーワードに対して Fragment を使用
    <React.Fragment key={child.id}>
      {/* 子キーワード自身の行をレンダリング */}
      <ChildKeywordRow
        keyword={child}
        level={level} // 現在のレベルを渡す
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {/* その子キーワードにさらに子が存在すれば、レベルを+1して再帰呼び出し */}
      {child.childKeywords && child.childKeywords.length > 0 && (
        renderChildKeywords(child.childKeywords, level + 1, onEdit, onDelete)
      )}
    </React.Fragment>
  ));
};

// --- Main Component ---

/**
 * キーワード一覧を表示するテーブルコンポーネント。
 * shadcn/ui の Table と Accordion を組み合わせて階層表示を実現します。
 * トップレベルのキーワードを AccordionTrigger とし、子キーワードを AccordionContent 内に
 * 再帰的にレンダリングします。
 */
export default function KeywordTable({ keywords, onEdit, onDelete }: KeywordTableProps) {
  // props で受け取ったキーワードリストから、トップレベル (parentId が null) のものだけを抽出
  const topLevelKeywords = keywords.filter(k => k.parentId === null);

  return (
    <div className="rounded-md border">
      {/* テーブルヘッダー (Accordion の外に配置し、常に表示) */}
      <Table>
        <TableHeader>
          <TableRow>
            {/* 各ヘッダーの幅は、Trigger/Row内の div の幅と合わせる */}
            <TableHead className="w-[350px]">キーワード名</TableHead>
            <TableHead className="w-[100px] text-right">検索Vol.</TableHead>
            <TableHead className="w-[80px]">難易度</TableHead>
            <TableHead className="w-[80px]">関連度</TableHead>
            <TableHead className="w-[100px]">検索意図</TableHead>
            <TableHead className="w-[80px]">重要度</TableHead>
            <TableHead className="flex-1 min-w-[150px]">メモ</TableHead>
            <TableHead className="w-[50px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* キーワードデータ表示部分 (Accordion を使用) */}
      {/* トップレベルキーワードが存在する場合 */}
      {topLevelKeywords && topLevelKeywords.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {/* 各トップレベルキーワードを AccordionItem としてレンダリング */}
          {topLevelKeywords.map((keyword) => (
            <AccordionItem value={`keyword-${keyword.id}`} key={keyword.id} className="border-b">
              {/* AccordionTrigger: トップレベルキーワードの情報を表示 */}
              <AccordionTrigger className="hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                {/* Trigger 内は TableRow ではなく flex コンテナでレイアウト */}
                <div className="flex items-center w-full px-4 py-2 text-sm">
                  {/* 各データセル (div) */}
                  <div className="w-[350px] font-medium text-left pr-4 truncate" title={keyword.keywordName}>{keyword.keywordName}</div>
                  <div className="w-[100px] text-right pr-4">{formatSearchVolume(keyword.searchVolume)}</div>
                  <div className="w-[80px] pr-4">
                    {/* 難易度 Badge */}
                    {keyword.difficulty && (
                      <Badge variant={
                        keyword.difficulty === '高' ? 'destructive' :
                          keyword.difficulty === '中' ? 'secondary' :
                            'outline'
                      }>
                        {formatNullable(keyword.difficulty)}
                      </Badge>
                    )}
                    {!keyword.difficulty && formatNullable(keyword.difficulty)} {/* Badge なし */}
                  </div>
                  <div className="w-[80px] pr-4">{formatNullable(keyword.relevance)}</div>
                  <div className="w-[100px] pr-4">{formatNullable(keyword.searchIntent)}</div>
                  <div className="w-[80px] pr-4">
                    {/* 重要度 Badge */}
                    {keyword.importance && (
                      <Badge variant={
                        keyword.importance === '高' ? 'default' :
                          keyword.importance === '中' ? 'secondary' :
                            'outline'
                      }>
                        {formatNullable(keyword.importance)}
                      </Badge>
                    )}
                    {!keyword.importance && formatNullable(keyword.importance)} {/* Badge なし */}
                  </div>
                  <div className="flex-1 min-w-[150px] pr-4 text-left truncate" title={keyword.memo ?? ""}>{formatNullable(keyword.memo)}</div>
                  {/* 操作メニュー (Dropdown) */}
                  <div className="w-[50px] text-right flex justify-end">
                    <DropdownMenu>
                      {/* Trigger ボタン: クリックイベントが AccordionTrigger に伝播しないように stopPropagation */}
                      <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">操作メニューを開く</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* 編集メニュー: クリックイベントが伝播しないように stopPropagation */}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(keyword); }}>
                          編集
                        </DropdownMenuItem>
                        {/* 削除メニュー: クリックイベントが伝播しないように stopPropagation */}
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onDelete(keyword.id); }}
                          className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                        >
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionTrigger>
              {/* AccordionContent: 子キーワードを表示する領域 */}
              <AccordionContent>
                {/* 子キーワードが存在すれば renderChildKeywords を呼び出して再帰的に表示 */}
                {keyword.childKeywords && keyword.childKeywords.length > 0 ? (
                  renderChildKeywords(keyword.childKeywords, 1, onEdit, onDelete) // 子のレベルは 1 から開始
                ) : (
                  // 子キーワードがない場合のメッセージ
                  <div className="px-4 py-2 text-sm text-muted-foreground" style={{ paddingLeft: `${1 * 1.5 + 1}rem` }}>子キーワードはありません。</div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        // トップレベルキーワードが存在しない場合の表示 (テーブル内にメッセージを表示)
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
