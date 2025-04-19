import type { ArticleItem } from '~/types/article';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { X, FileText, Link as LinkIcon, BarChart2, ExternalLink, ArrowDownToLine, GripVertical } from "lucide-react";
import { ArticleBasicInfo } from './ArticleBasicInfo';
import { ArticleLinksList } from './ArticleLinksList';
import { ArticleSeoAnalysis } from './ArticleSeoAnalysis';
import { LinkDetailView } from './LinkDetailView';
import { useState, useEffect, useCallback, useRef } from 'react';

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
  initialTab?: 'basic' | 'links' | 'seo'; // 初期表示タブ
  isOpen: boolean;
  onClose: () => void;
  articles: ArticleItem[]; // 全記事データを追加（リンク先/元の記事情報を取得するため）
  onWidthChange?: (width: number) => void; // サイドバーの幅が変更されたときに呼び出されるコールバック
}

/**
 * 記事詳細を表示するサイドバーコンポーネント
 * SEO観点での内部リンク分析情報も表示
 * リサイズ機能付き
 */
export default function ArticleDetailSidebar({
  article,
  selectedLink,
  sidebarMode,
  linkListType,
  initialTab = 'basic', // デフォルト値を設定
  isOpen,
  onClose,
  articles,
  onWidthChange
}: ArticleDetailSidebarProps) {
  // 表示する記事データ（モードによって切り替え）
  const displayArticle = sidebarMode === 'articleDetail' ? article : null;
  const displayLink = sidebarMode === 'linkDetail' ? selectedLink : null;
  
  // サイドバーの幅を状態として管理
  const [sidebarWidth, setSidebarWidth] = useState(600); // デフォルト幅を600pxに増加
  const minWidth = 400; // 最小幅を400pxに設定
  const maxWidth = 1200; // 最大幅を1200pxに拡大
  
  // リサイズ中かどうかの状態
  const [isResizing, setIsResizing] = useState(false);
  
  // 前回のマウス位置を記録するためのref
  const lastMouseXRef = useRef<number>(0);
  
  // サイドバーのref
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // リサイズ開始時の処理
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    lastMouseXRef.current = e.clientX;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none'; // テキスト選択を防止
  }, []);
  
  // リサイズ中の処理
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = lastMouseXRef.current - e.clientX;
    lastMouseXRef.current = e.clientX;
    
    setSidebarWidth(prevWidth => {
      const newWidth = prevWidth + deltaX;
      // 最小・最大幅の制限を適用
      return Math.max(minWidth, Math.min(newWidth, maxWidth));
    });
  }, [isResizing, minWidth, maxWidth]);
  
  // リサイズ終了時の処理
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // 親コンポーネントに幅の変更を通知
    if (onWidthChange) {
      onWidthChange(sidebarWidth);
    }
  }, [sidebarWidth, onWidthChange]);
  
  // マウスイベントのリスナーを設定
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  // どちらのデータもない場合は何も表示しない
  if (!displayArticle && !displayLink) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-[4rem] right-0 h-[calc(100vh-4rem)] bg-background/100 border-l border-border shadow-xl flex flex-col z-30 transition-all duration-300 ease-in-out ${isOpen ? 'w-auto' : 'w-0 overflow-hidden'}`}
      style={{ width: isOpen ? `${sidebarWidth}px` : 0 }}
    >
      {/* リサイズハンドル */}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize group z-10"
        onMouseDown={handleResizeStart}
      >
        <div className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-12 flex items-center justify-center rounded-l-sm bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-100 ${isResizing ? 'opacity-100' : ''} transition-opacity`}>
          <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
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
          <Tabs 
            key={`tabs-${initialTab}-${displayArticle.id}`} 
            defaultValue={initialTab} 
            className="flex flex-col h-full"
          >
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

            {/* 内部リンクタブ　 (linkListTypeに応じて表示切替) */}
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
