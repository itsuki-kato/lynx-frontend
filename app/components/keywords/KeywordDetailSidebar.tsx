import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose, // Close ボタン用にインポート
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator"; // 区切り線用
import type { Keyword } from '~/types/keyword';

/**
 * null または undefined の値をハイフン '-' に変換するフォーマット関数
 */
const formatNullable = (value: string | number | null | undefined): string | number => value ?? "-";

/**
 * 検索ボリュームを桁区切りでフォーマットする関数
 */
const formatSearchVolume = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString();
}

/**
 * キーワード詳細表示用サイドバーの Props 定義
 */
interface KeywordDetailSidebarProps {
  /** サイドバーが開いているかどうか */
  isOpen: boolean;
  /** サイドバーの開閉状態を更新する関数 */
  setOpen: (isOpen: boolean) => void;
  /** 表示するキーワードデータ (null の場合は何も表示しない) */
  keyword: Keyword | null;
}

/**
 * キーワードの詳細情報を表示するサイドバーコンポーネント。
 */
export default function KeywordDetailSidebar({
  isOpen,
  setOpen,
  keyword,
}: KeywordDetailSidebarProps) {
  if (!keyword) {
    return null; // 表示するキーワードがない場合は何もレンダリングしない
  }

  // 詳細表示用のラベルと値のペアを生成するヘルパーコンポーネント
  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-2 py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm col-span-2">{value}</dd>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto"> {/* 幅とスクロールを設定 */}
        <SheetHeader className="mb-4">
          <SheetTitle>キーワード詳細</SheetTitle>
          <SheetDescription>
            選択されたキーワードの詳細情報を表示します。
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {/* キーワード詳細情報 */}
        <dl className="mt-4 space-y-1">
          <DetailItem label="ID" value={keyword.id} />
          <DetailItem label="キーワード名" value={keyword.keywordName} />
          <DetailItem label="検索ボリューム" value={formatSearchVolume(keyword.searchVolume)} />
          <DetailItem
            label="難易度"
            value={
              keyword.difficulty ? (
                <Badge variant={
                  keyword.difficulty === '高' ? 'destructive' :
                    keyword.difficulty === '中' ? 'secondary' :
                      'outline'
                }>
                  {formatNullable(keyword.difficulty)}
                </Badge>
              ) : formatNullable(keyword.difficulty)
            }
          />
          <DetailItem label="関連度" value={formatNullable(keyword.relevance)} />
          <DetailItem label="検索意図" value={formatNullable(keyword.searchIntent)} />
          <DetailItem
            label="重要度"
            value={
              keyword.importance ? (
                <Badge variant={
                  keyword.importance === '高' ? 'default' :
                    keyword.importance === '中' ? 'secondary' :
                      'outline'
                }>
                  {formatNullable(keyword.importance)}
                </Badge>
              ) : formatNullable(keyword.importance)
            }
          />
          <DetailItem label="メモ" value={keyword.memo ? <p className="whitespace-pre-wrap">{keyword.memo}</p> : "-"} />
          <DetailItem label="親キーワードID" value={formatNullable(keyword.parentId)} />
          {/* 必要に応じて他の情報も追加 */}
          {/* 例: <DetailItem label="作成日時" value={new Date(keyword.createdAt).toLocaleString()} /> */}
          {/* 例: <DetailItem label="更新日時" value={new Date(keyword.updatedAt).toLocaleString()} /> */}
        </dl>

        <Separator className="my-4" />

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">閉じる</Button>
          </SheetClose>
          {/* 必要であれば編集ボタンなどを追加 */}
          {/* <Button onClick={() => { }}>編集</Button> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
