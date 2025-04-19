import type { ArticleItem } from '~/types/article';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { X, FileText, Link as LinkIcon, BarChart2, ExternalLink, ArrowDownToLine } from "lucide-react";
import { ArticleBasicInfo } from './ArticleBasicInfo';
import { ArticleLinksList } from './ArticleLinksList';
import { ArticleSeoAnalysis } from './ArticleSeoAnalysis';
import { LinkDetailView } from './LinkDetailView';

// リンク情報を表示するための型
interface LinkDetail {
  source: ArticleItem;
  target: ArticleItem;
}

interface ArticleDetailSidebarProps {
  article: ArticleItem | null; // articleDetail モード用
  selectedLink: LinkDetail | null; // linkDetail モード用
  sidebarMode: 'articleDetail' | 'linkDetail';
  linkListType: 'incoming' | 'outgoing' | null; // articleDetail モードでリンク一覧表示用
  isOpen: boolean;
  onClose: () => void;
  articles: ArticleItem[]; // 全記事データを追加（リンク先/元の記事情報を取得するため）
}

/**
 * 記事詳細を表示するサイドバーコンポーネント
 * SEO観点での内部リンク分析情報も表示
 */
export default function ArticleDetailSidebar({
  article,
  selectedLink,
  sidebarMode,
  linkListType,
  isOpen,
  onClose,
  articles
}: ArticleDetailSidebarProps) {
  // 表示する記事データ（モードによって切り替え）
  const displayArticle = sidebarMode === 'articleDetail' ? article : null;
  const displayLink = sidebarMode === 'linkDetail' ? selectedLink : null;

  // どちらのデータもない場合は何も表示しない
  if (!displayArticle && !displayLink) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[320px] sm:w-[400px] md:w-[480px] lg:w-[540px] bg-background/100 border-l border-border shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      {/* ヘッダー (スクロールしない部分) */}
      <div className="p-6 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">
            {sidebarMode === 'articleDetail' ? '記事詳細' : 'リンク詳細'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sidebarMode === 'articleDetail'
              ? '選択された記事の情報を表示します。'
              : '選択された内部リンクの情報を表示します。'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </Button>
      </div>

      {/* スクロール可能領域 */}
      <div className="flex-grow overflow-y-auto">
        {/* --- articleDetail モード --- */}
        {sidebarMode === 'articleDetail' && displayArticle && (
          <Tabs defaultValue={linkListType ? 'links' : 'basic'} className="flex flex-col h-full">
            {/* タブリスト */}
            <div className="px-6 pt-4 sticky top-0 bg-background z-10">
              <TabsList className="grid grid-cols-3 w-full p-1 rounded-lg bg-muted/80">
                <TabsTrigger 
                  value="basic" 
                  className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>基本情報</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="links"
                  className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  {linkListType === 'incoming' ? (
                    <ArrowDownToLine className="h-4 w-4" />
                  ) : linkListType === 'outgoing' ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  <span className="truncate">
                    {linkListType === 'incoming' ? '被リンク一覧' : linkListType === 'outgoing' ? '発リンク一覧' : '内部リンク'}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="seo"
                  className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>SEO分析</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 基本情報タブ */}
            <TabsContent value="basic" className="px-6 pb-6 mt-4">
              <ArticleBasicInfo article={displayArticle} />
            </TabsContent>

            {/* 内部リンクタブ (linkListTypeに応じて表示切替) */}
            <TabsContent value="links" className="px-6 pb-6 mt-4">
              <ArticleLinksList 
                article={displayArticle} 
                type={linkListType || 'both'} 
                articles={articles} // 全記事データを渡す
              />
            </TabsContent>

            {/* SEO分析タブ */}
            <TabsContent value="seo" className="px-6 pb-6 mt-4">
              <ArticleSeoAnalysis 
                article={displayArticle} 
                articleId={displayArticle.id ? String(displayArticle.id) : undefined} 
              />
            </TabsContent>
          </Tabs>
        )}

        {/* --- linkDetail モード --- */}
        {sidebarMode === 'linkDetail' && displayLink && (
          <LinkDetailView linkDetail={displayLink} />
        )}
      </div>

      {/* フッター (スクロールしない部分) */}
      <div className="p-6 flex-shrink-0">
        <Button variant="outline" onClick={onClose} className="w-full">
          閉じる
        </Button>
      </div>
    </div>
  );
}
