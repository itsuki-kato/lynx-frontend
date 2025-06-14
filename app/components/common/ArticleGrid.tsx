import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import type { ArticleItem } from "~/types/article";
import { useNavigate } from "react-router";
import { useState } from "react";

interface ArticleGridProps {
  articles: ArticleItem[];
  onCardClick: (item: ArticleItem) => void;
  noDataMessage?: string;
  noDataButtonText?: string;
  noDataButtonLink?: string;
  cardVariant?: 'emerald' | 'blue'; // カードのテーマカラー
  searchTerm?: string; // 検索語（データなし表示で使用）
  // チェックボックス関連のプロパティ
  showCheckboxes?: boolean;
  selectedArticles?: Set<number>;
  onArticleSelect?: (articleId: number, checked: boolean) => void;
  maxSelections?: number;
}

// 各カードのテーマカラー定義
const cardThemes = {
  emerald: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverShadow: "hover:shadow-emerald-100/20 dark:hover:shadow-emerald-900/10",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
    titleHoverColor: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
    internalLinkColor: "text-emerald-600 dark:text-emerald-400",
    externalLinkColor: "text-blue-600 dark:text-blue-400", // 外部リンクは青系で統一する場合
    indexableBadgeBg: "bg-emerald-100 hover:bg-emerald-200",
    indexableBadgeText: "text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/40",
    jsonLdBadgeBg: "bg-blue-100 hover:bg-blue-200",
    jsonLdBadgeText: "text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40",
    noDataButtonGradient: "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600",
    selectedBorder: "border-emerald-500 dark:border-emerald-400",
    selectedShadow: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
  },
  blue: {
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverShadow: "hover:shadow-blue-100/20 dark:hover:shadow-blue-900/10",
    hoverBorder: "hover:border-blue-200 dark:hover:border-blue-800",
    titleHoverColor: "group-hover:text-blue-700 dark:group-hover:text-blue-400",
    internalLinkColor: "text-blue-600 dark:text-blue-400",
    externalLinkColor: "text-indigo-600 dark:text-indigo-400", // 外部リンクは紫系で統一する場合
    indexableBadgeBg: "bg-blue-100 hover:bg-blue-200",
    indexableBadgeText: "text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40",
    jsonLdBadgeBg: "bg-indigo-100 hover:bg-indigo-200",
    jsonLdBadgeText: "text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40",
    noDataButtonGradient: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    selectedBorder: "border-blue-500 dark:border-blue-400",
    selectedShadow: "shadow-blue-200/50 dark:shadow-blue-900/30",
  }
};

export function ArticleGrid({
  articles,
  onCardClick,
  noDataMessage = "データがありません",
  noDataButtonText = "スクレイピング画面へ",
  noDataButtonLink = "/scraping",
  cardVariant = 'emerald', // デフォルトはemerald
  searchTerm = "",
  showCheckboxes = false,
  selectedArticles = new Set(),
  onArticleSelect,
  maxSelections = 10,
}: ArticleGridProps) {
  const navigate = useNavigate();
  const theme = cardThemes[cardVariant];

  const handleCheckboxChange = (articleId: string | number | undefined, checked: boolean | string) => {
    if (onArticleSelect && articleId !== undefined) {
      // 最大選択数チェック
      const isChecked = checked === true || checked === "true";
      if (isChecked && selectedArticles.size >= maxSelections) {
        return; // 最大選択数に達している場合は選択を許可しない
      }
      // string型のIDをnumber型に変換
      const numericId = typeof articleId === 'string' ? parseInt(articleId, 10) : articleId;
      if (!isNaN(numericId)) {
        onArticleSelect(numericId, isChecked);
      }
    }
  };

  const handleCardClick = (item: ArticleItem, event: React.MouseEvent) => {
    // チェックボックスがクリックされた場合は、カードクリックを無効にする
    if ((event.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    onCardClick(item);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.length > 0 ? (
        articles.map((item: ArticleItem) => {
          // string型のIDをnumber型に変換してチェック
          const numericId = item.id !== undefined ? (typeof item.id === 'string' ? parseInt(item.id, 10) : item.id) : undefined;
          const isSelected = numericId !== undefined && !isNaN(numericId) && selectedArticles.has(numericId);
          const isDisabled = !isSelected && selectedArticles.size >= maxSelections;
          
          return (
            <Card
              key={item.id}
              className={`group h-full flex flex-col bg-gradient-to-br from-card to-background border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 rounded-xl overflow-hidden cursor-pointer relative ${
                isSelected 
                  ? `${theme.selectedBorder} ${theme.selectedShadow} shadow-lg` 
                  : `border-border ${theme.hoverShadow} ${theme.hoverBorder}`
              }`}
              onClick={(e) => handleCardClick(item, e)}
            >
              {/* チェックボックス表示 */}
              {showCheckboxes && (
                <div className="absolute top-4 right-4 z-10" data-checkbox>
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => handleCheckboxChange(item.id, checked)}
                    className={`w-5 h-5 ${isSelected ? 'border-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                  />
                </div>
              )}

              {/* コンテンツ部分 */}
              <CardHeader className="pb-2 pt-6">
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 rounded-full ${theme.iconBg} flex items-center justify-center mr-2 ${theme.iconColor}`}>
                    {/* アイコンは共通化 */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <CardTitle className={`text-xl line-clamp-2 ${theme.titleHoverColor} transition-colors duration-200 ${showCheckboxes ? 'pr-8' : ''}`}>
                    {item.metaTitle || "タイトルなし"}
                  </CardTitle>
                </div>
                <CardDescription>
                  <a
                    href={item.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block" // URLの色は共通
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.articleUrl}
                  </a>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="text-muted-foreground text-sm line-clamp-4 group-hover:text-foreground transition-colors duration-200">
                  {item.metaDescription || "コンテンツなし"}
                </div>
              </CardContent>

              {/* メトリクス表示 */}
              <div className="px-6 py-3 grid grid-cols-2 gap-2 border-t border-border/40">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">内部リンク</span>
                  <span className={`font-semibold ${theme.internalLinkColor}`}>{item.internalLinks?.length || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">外部リンク</span>
                  <span className={`font-semibold ${theme.externalLinkColor}`}>{item.outerLinks?.length || 0}</span>
                </div>
              </div>

              {/* フッター部分（常に最下部） */}
              <CardFooter className="bg-gradient-to-r from-muted/50 to-muted border-t border-border/40 justify-between mt-auto py-3">
                <div className="flex items-center space-x-1">
                  <Badge
                    variant={item.isIndexable ? "default" : "destructive"}
                    className={item.isIndexable
                      ? `${theme.indexableBadgeBg} ${theme.indexableBadgeText}`
                      : "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40" // Noindexは共通
                    }
                  >
                    {item.isIndexable ? "インデックス" : "ノーインデックス"}
                  </Badge>

                  {item.jsonLd && item.jsonLd.length > 0 && (
                    <Badge className={`${theme.jsonLdBadgeBg} ${theme.jsonLdBadgeText}`}>
                      構造化データ
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-muted-foreground text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  {item?.internalLinks?.length + item?.outerLinks?.length || 0} リンク
                </div>
              </CardFooter>
            </Card>
          );
        })
      ) : (
        <Card className="p-8 text-center animate-fade-in col-span-1 md:col-span-2 lg:col-span-3">
          <CardContent className="flex flex-col items-center pt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchTerm ? "検索結果なし" : "データなし"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "検索条件に一致するコンテンツがありません" : noDataMessage}
            </p>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <Button
              onClick={() => navigate(noDataButtonLink)}
              className={`mt-4 ${theme.noDataButtonGradient} text-white`}
            >
              {noDataButtonText}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
