import React, { useMemo } from 'react';
import type { ArticleItem } from '~/types/article';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from '~/lib/utils';
import { AlertTriangle, Check, Hash } from 'lucide-react';

interface InternalLinkMatrixProps {
  articles: ArticleItem[];
  onHeaderClick: (article: ArticleItem, type: 'incoming' | 'outgoing') => void; // ヘッダークリック用（typeパラメータを追加）
  onLinkCountClick: (article: ArticleItem, type: 'incoming' | 'outgoing') => void; // リンク数クリック用
  onLinkCellClick: (sourceArticle: ArticleItem, targetArticle: ArticleItem) => void; // セルクリック用
}

/**
 * 内部リンクのマトリクス表示コンポーネント
 * 行: リンク先記事 / 列: リンク元記事
 */
export default function InternalLinkMatrix({
  articles,
  onHeaderClick,
  onLinkCountClick,
  onLinkCellClick
}: InternalLinkMatrixProps): React.ReactNode {
  // 孤立記事（発リンクも被リンクもない）のIDセットを作成
  const isolatedArticleIds = useMemo(() => {
    return new Set(
      articles
        .filter(article =>
          (article.internalLinks?.length || 0) === 0 &&
          (article.linkedFrom?.length || 0) === 0
        )
        .map(article => article.id)
    );
  }, [articles]);

  // マトリクス表示に基づいたリンク有無を事前に計算（行と列を入れ替え）
  const linkMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    // 行が被リンク記事（リンク先）、列が発リンク記事（リンク元）
    articles.forEach(rowArticle => {
      const rowId = rowArticle.id; // 行ID（被リンク記事）
      if (rowId === undefined) return;
      matrix[rowId] = {};

      articles.forEach(colArticle => {
        const colId = colArticle.id; // 列ID（発リンク記事）
        if (colId === undefined) return;

        const isSelfLink = rowId === colId;
        if (isSelfLink) {
          matrix[rowId][colId] = false;
          return;
        }

        // 列の記事（発リンク記事）から行の記事（被リンク記事）へのリンクがあるか確認
        const hasLink = colArticle.internalLinks?.some(link => {
          try {
            const linkUrl = new URL(link.linkUrl);
            const articleUrl = new URL(rowArticle.articleUrl);
            const normalizedLinkUrl = `${linkUrl.origin}${linkUrl.pathname}`.replace(/\/$/, '');
            const normalizedArticleUrl = `${articleUrl.origin}${articleUrl.pathname}`.replace(/\/$/, '');
            return normalizedLinkUrl === normalizedArticleUrl;
          } catch (e) {
            return link.linkUrl === rowArticle.articleUrl;
          }
        }) || false;

        matrix[rowId][colId] = hasLink;
      });
    });
    return matrix;
  }, [articles]);

  // 各記事の被リンク数（行のチェック数）を計算
  const incomingLinksCount = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(rowArticle => {
      const rowId = rowArticle.id;
      if (rowId === undefined) return;
      counts[rowId] = articles.reduce((sum, colArticle) => {
        const colId = colArticle.id;
        if (colId === undefined) return sum;
        return sum + (linkMatrix[rowId]?.[colId] ? 1 : 0);
      }, 0);
    });
    return counts;
  }, [articles, linkMatrix]);

  // 各記事の発リンク数（列のチェック数）を計算
  const outgoingLinksCount = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(colArticle => {
      const colId = colArticle.id;
      if (colId === undefined) return;
      counts[colId] = articles.reduce((sum, rowArticle) => {
        const rowId = rowArticle.id;
        if (rowId === undefined) return sum;
        return sum + (linkMatrix[rowId]?.[colId] ? 1 : 0);
      }, 0);
    });
    return counts;
  }, [articles, linkMatrix]);

  /**
   * リンクの有無に基づく色の設定
   * SEO観点での内部リンク可視化のため、リンクの有無を色で表現
   */
  const getCellStyle = (hasLink: boolean, isSelfLink: boolean, isIsolatedArticle: boolean) => {
    // 自分自身へのリンクの場合
    if (isSelfLink) {
      return "bg-gray-200 dark:bg-gray-700";
    }

    // 孤立記事の場合は特別なスタイルを適用
    if (isIsolatedArticle) {
      return hasLink
        ? "bg-emerald-100 dark:bg-emerald-900 border-red-300 dark:border-red-800 cursor-pointer"
        : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 cursor-pointer";
    }

    // 通常のリンク有無による色分け（ホバー効果なし）
    if (hasLink) {
      return "bg-emerald-100 dark:bg-emerald-900 cursor-pointer";
    } else {
      return "bg-gray-50 dark:bg-gray-800 cursor-pointer";
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden relative w-full" style={{ scrollbarWidth: 'thin' }}>
      <Table>
        <TableHeader>
          <TableRow>
            {/* 左上の空セル */}
            <TableHead className="sticky left-0 top-0 z-20 bg-background border-r border-b w-40 min-w-[160px]"> {/* 固定 */}
              <div>
                <span>発リンク →</span>
                <br />
                <span>被リンク ↓</span>
              </div>
            </TableHead>
            {/* 発リンク側のリンク数列ヘッダー */}
            <TableHead
              className="border-b border-l w-16 min-w-[64px] text-center align-middle sticky top-0 z-10 bg-background" // 幅を調整
            >
              <div className="flex items-center justify-center">
                <Hash className="h-4 w-4 mr-1" />
                <span>リンク数</span>
              </div>
            </TableHead>
            {/* 列ヘッダー (発リンク記事) */}
            {articles.map((colArticle) => (
              <TableHead
                key={`col-${colArticle.id}`}
                className="border-b border-l w-24 min-w-[96px] text-center align-middle sticky top-0 z-10 bg-background cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                title={`${colArticle.metaTitle}\n記事URL: ${colArticle.articleUrl}\n被リンク: ${colArticle.linkedFrom?.length || 0}\n発リンク: ${colArticle.internalLinks?.length || 0}`}
                onClick={() => onHeaderClick(colArticle, 'outgoing')} // 発リンク記事ヘッダークリック
              >
                <div className="p-1 max-h-72 overflow-y-auto">
                  <div className="text-xs leading-relaxed break-words">
                    {colArticle.metaTitle || `記事ID: ${colArticle.id}`}
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
          {/* チェック数行 */}
          <TableRow>
            {/* 左端のラベルセル */}
            <TableHead
              className="sticky left-0 z-10 bg-background border-r font-medium w-40 min-w-[160px] align-middle"
            >
              <div className="flex items-center justify-center">
                <Hash className="h-4 w-4 mr-1" />
                <span>リンク数</span>
              </div>
            </TableHead>
            {/* 空のセル（被リンク側のリンク数列との交差部分） */}
            <TableCell className="border border-l text-center bg-gray-100 dark:bg-gray-800">
            </TableCell>
            {/* 各列の発リンク数 */}
            {articles.map((colArticle) => {
              const count = colArticle.id !== undefined ? outgoingLinksCount[colArticle.id] || 0 : 0;
              const isZero = count === 0;

              return (
                <TableCell
                  key={`check-count-col-${colArticle.id}`}
                  className={cn(
                    "border border-l text-center font-medium bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 w-16 min-w-[64px]", // 幅を調整
                    isZero ? 'text-red-600 dark:text-red-400' : ''
                  )}
                  onClick={() => onLinkCountClick(colArticle, 'outgoing')} // 発リンク数クリック
                >
                  {count}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 行 (リンク元記事) */}
          {articles.map((rowArticle) => (
            <TableRow
              key={`row-${rowArticle.id}`}
            >
              {/* 行ヘッダー (被リンク記事) */}
              <TableHead
                scope="row"
                className="sticky left-0 z-10 bg-background border-r font-medium w-40 min-w-[160px] align-middle cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                title={`${rowArticle.metaTitle}\n記事URL: ${rowArticle.articleUrl}\n被リンク: ${rowArticle.linkedFrom?.length || 0}\n発リンク: ${rowArticle.internalLinks?.length || 0}`}
                onClick={() => onHeaderClick(rowArticle, 'incoming')} // 被リンク記事ヘッダークリック
              >
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {rowArticle.metaTitle || `記事ID: ${rowArticle.id}`}
                </div>
              </TableHead>
              {/* 被リンク数 */}
              <TableCell
                className={cn(
                  "border border-l text-center font-medium bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 sticky min-w-[64px]",
                  rowArticle.id !== undefined && incomingLinksCount[rowArticle.id] === 0 ? 'text-red-600 dark:text-red-400' : ''
                )}
                onClick={() => onLinkCountClick(rowArticle, 'incoming')} // 被リンク数クリック
              >
                {rowArticle.id !== undefined ? incomingLinksCount[rowArticle.id] || 0 : 0}
              </TableCell>

              {/* セル (リンク有無) - 行が被リンク記事、列が発リンク記事 */}
              {articles.map((colArticle) => {
                const rowId = rowArticle.id; // 被リンク記事ID
                const colId = colArticle.id; // 発リンク記事ID

                // 事前に計算したマトリクスからリンク有無を取得
                const hasLink = rowId !== undefined && colId !== undefined ? linkMatrix[rowId]?.[colId] || false : false;
                const isSelfLink = rowId === colId;
                const isRowIsolated = rowId !== undefined && isolatedArticleIds.has(rowId);
                const isColIsolated = colId !== undefined && isolatedArticleIds.has(colId);

                return (
                  <TableCell
                    key={`cell-${rowId}-${colId}`}
                    className={cn(
                      "border border-l text-center p-0 h-12 w-12 min-w-[48px]",
                      getCellStyle(
                        hasLink,
                        isSelfLink,
                        isRowIsolated || isColIsolated // Use checked results
                      )
                    )}
                    onClick={() => !isSelfLink && hasLink && onLinkCellClick(colArticle, rowArticle)} // セルクリック (発リンク元, 被リンク先)
                    title={isSelfLink
                      ? "自分自身へのリンク"
                      : `${colArticle.metaTitle || `記事ID: ${colArticle.id}`} → ${rowArticle.metaTitle || `記事ID: ${rowArticle.id}`} (${hasLink ? 'リンクあり' : 'リンクなし'})`
                    }
                  >
                    {/* リンクの有無を表示（アイコン） */}
                    {hasLink && !isSelfLink && (
                      <Check className="h-4 w-4 mx-auto text-emerald-600 dark:text-emerald-400" />
                    )}

                    {/* 孤立記事の場合は警告アイコンを表示 */}
                    {!hasLink && !isSelfLink && isRowIsolated && isColIsolated && (
                      <AlertTriangle className="h-4 w-4 mx-auto text-red-500 dark:text-red-400 opacity-50" />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
