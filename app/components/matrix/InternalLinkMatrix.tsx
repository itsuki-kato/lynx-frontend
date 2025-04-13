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
  onCellClick: (targetArticle: ArticleItem) => void;
}

/**
 * 内部リンクのマトリクス表示コンポーネント
 * 行: リンク元記事 / 列: リンク先記事
 */
export default function InternalLinkMatrix({ articles, onCellClick }: InternalLinkMatrixProps): React.ReactNode {
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

  // マトリクス表示に基づいたリンク有無を事前に計算
  const linkMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, boolean>> = {};
    articles.forEach(rowArticle => {
      const rowId = rowArticle.id; // Store ID
      if (rowId === undefined) return; // Check ID
      matrix[rowId] = {}; // Initialize only if ID is valid
      articles.forEach(colArticle => {
        const colId = colArticle.id; // Store ID
        if (colId === undefined) return; // Check ID

        const isSelfLink = rowId === colId;
        if (isSelfLink) {
          matrix[rowId][colId] = false; // Use stored IDs
          return;
        }
        const hasLink = rowArticle.internalLinks?.some(link => {
          try {
            const linkUrl = new URL(link.linkUrl);
            const articleUrl = new URL(colArticle.articleUrl);
            const normalizedLinkUrl = `${linkUrl.origin}${linkUrl.pathname}`.replace(/\/$/, '');
            const normalizedArticleUrl = `${articleUrl.origin}${articleUrl.pathname}`.replace(/\/$/, '');
            return normalizedLinkUrl === normalizedArticleUrl;
          } catch (e) {
            return link.linkUrl === colArticle.articleUrl;
          }
        }) || false;
        matrix[rowId][colId] = hasLink; // Use stored IDs
      });
    });
    return matrix;
  }, [articles]);

  // 各記事のリンク元としてのチェック数（行のチェック数）を計算
  const outgoingLinksCount = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(rowArticle => {
      const rowId = rowArticle.id;
      if (rowId === undefined) return;
      counts[rowId] = articles.reduce((sum, colArticle) => {
        const colId = colArticle.id;
        if (colId === undefined) return sum;
        // Access linkMatrix using checked IDs
        return sum + (linkMatrix[rowId]?.[colId] ? 1 : 0);
      }, 0);
    });
    return counts;
  }, [articles, linkMatrix]);

  // 各記事のリンク先としてのチェック数（列のチェック数）を計算
  const incomingLinksCount = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(colArticle => {
      const colId = colArticle.id;
      if (colId === undefined) return;
      counts[colId] = articles.reduce((sum, rowArticle) => {
        const rowId = rowArticle.id;
        if (rowId === undefined) return sum;
        // Access linkMatrix using checked IDs
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
    <div className="overflow-x-auto relative w-full" style={{ scrollbarWidth: 'thin' }}>
      <Table className="border w-max"> {/* w-max を使用して内容に合わせた幅を確保 */}
        <TableHeader>
          <TableRow>
            {/* 左上の空セル */}
            <TableHead className="sticky left-0 top-0 z-20 bg-background border-r border-b w-40 min-w-[160px]"> {/* 固定 */}
              <div className="flex items-center justify-between">
                <span>発リンク ↓ / 被リンク →</span>
              </div>
            </TableHead>
            {/* チェック数列ヘッダー */}
            <TableHead
              className="border-b border-l min-w-[80px] text-center align-middle sticky top-0 z-10 bg-background"
            >
              <div className="flex items-center justify-center">
                <Hash className="h-4 w-4 mr-1" />
                <span>リンク数</span>
              </div>
            </TableHead>
            {/* 列ヘッダー (リンク先記事) */}
            {articles.map((colArticle) => (
              <TableHead
                key={`col-${colArticle.id}`}
                className="border-b border-l min-w-[150px] text-center align-middle sticky top-0 z-10 bg-background"
                title={`${colArticle.metaTitle}\n記事URL: ${colArticle.articleUrl}\n被リンク: ${colArticle.linkedFrom?.length || 0}\n発リンク: ${colArticle.internalLinks?.length || 0}`}
              >
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {colArticle.metaTitle || `記事ID: ${colArticle.id}`}
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
            {/* 空のセル（チェック数列との交差部分） */}
            <TableCell className="border border-l text-center bg-gray-100 dark:bg-gray-800">
            </TableCell>
            {/* 各列のチェック数 */}
            {articles.map((colArticle) => {
              const count = colArticle.id !== undefined ? incomingLinksCount[colArticle.id] || 0 : 0;
              const isZero = count === 0;

              return (
                <TableCell
                  key={`check-count-col-${colArticle.id}`}
                  className={`border border-l text-center font-medium bg-gray-50 dark:bg-gray-800 ${isZero ? 'text-red-600 dark:text-red-400' : ''}`}
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
              {/* 行ヘッダー (リンク元記事) */}
              <TableHead
                scope="row"
                className="sticky left-0 z-10 bg-background border-r font-medium w-40 min-w-[160px] align-middle"
                title={`${rowArticle.metaTitle}\n記事URL: ${rowArticle.articleUrl}\n被リンク: ${rowArticle.linkedFrom?.length || 0}\n発リンク: ${rowArticle.internalLinks?.length || 0}`}
              >
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {rowArticle.metaTitle || `記事ID: ${rowArticle.id}`}
                </div>
              </TableHead>
              {/* リンク元としてのチェック数 */}
              {(() => {
                const count = rowArticle.id !== undefined ? outgoingLinksCount[rowArticle.id] || 0 : 0;
                const isZero = count === 0;

                return (
                  <TableCell
                    className={`border border-l text-center font-medium bg-gray-50 dark:bg-gray-800 ${isZero ? 'text-red-600 dark:text-red-400' : ''}`}
                  >
                    {count}
                  </TableCell>
                );
              })()}

              {/* セル (リンク有無) */}
              {articles.map((colArticle) => {
                const rowId = rowArticle.id;
                const colId = colArticle.id;

                // 事前に計算したマトリクスからリンク有無を取得
                const hasLink = rowId !== undefined && colId !== undefined ? linkMatrix[rowId]?.[colId] || false : false;
                const isSelfLink = rowId === colId;
                const isRowIsolated = rowId !== undefined && isolatedArticleIds.has(rowId);
                const isColIsolated = colId !== undefined && isolatedArticleIds.has(colId);

                return (
                  <TableCell
                    key={`cell-${rowId}-${colId}`}
                    className={cn(
                      "border border-l text-center p-0 h-12 w-12",
                      getCellStyle(
                        hasLink,
                        isSelfLink,
                        isRowIsolated || isColIsolated // Use checked results
                      )
                    )}
                    onClick={() => !isSelfLink && colArticle && onCellClick(colArticle)} // Add null check for colArticle potentially?
                    title={isSelfLink
                      ? "自分自身へのリンク"
                      : `${rowArticle.metaTitle || `記事ID: ${rowArticle.id}`} → ${colArticle.metaTitle || `記事ID: ${colArticle.id}`} (${hasLink ? 'リンクあり' : 'リンクなし'})`
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
