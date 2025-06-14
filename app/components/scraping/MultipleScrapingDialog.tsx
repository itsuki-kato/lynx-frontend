import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { useToast } from "~/hooks/use-toast";
import { useMultipleScraping } from "~/hooks/use-multiple-scraping";
import { crawlStatusAtom, progressInfoAtom, scrapingErrorMessageAtom } from "~/atoms/scraping";
import type { ArticleMinimalItem } from "~/types/article";

interface MultipleScrapingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allMinimalArticles: ArticleMinimalItem[];
  isLoadingMinimalArticles: boolean;
  projectId: number;
  token: string;
}

export function MultipleScrapingDialog({
  isOpen,
  onOpenChange,
  allMinimalArticles,
  isLoadingMinimalArticles,
  projectId,
  token,
}: MultipleScrapingDialogProps) {
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [targetClass, setTargetClass] = useState("");
  
  // Jotai atoms for scraping state
  const [crawlStatus] = useAtom(crawlStatusAtom);
  const [progressInfo] = useAtom(progressInfoAtom);
  const [errorMessage] = useAtom(scrapingErrorMessageAtom);
  
  const { toast } = useToast();
  const { startMultipleScraping, cancelScraping } = useMultipleScraping();

  const isScrapingInProgress = crawlStatus === "running";

  // チェックボックス関連のハンドラー
  const handleArticleSelect = (articleId: number, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      if (newSelected.size >= 10) {
        toast({
          title: "選択制限",
          description: "一度に選択できる記事は10個までです。",
          variant: "destructive",
        });
        return;
      }
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  };

  // 全選択/全解除
  const handleSelectAll = () => {
    if (selectedArticles.size === allMinimalArticles.length) {
      setSelectedArticles(new Set());
    } else {
      const newSelected = new Set<number>();
      allMinimalArticles.slice(0, 10).forEach(article => {
        newSelected.add(article.id);
      });
      setSelectedArticles(newSelected);
    }
  };

  // スクレイピング実行
  const handleScraping = async () => {
    if (selectedArticles.size === 0) {
      toast({
        title: "エラー",
        description: "スクレイピングする記事を選択してください。",
        variant: "destructive",
      });
      return;
    }

    if (!targetClass.trim()) {
      toast({
        title: "エラー",
        description: "対象クラス名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    const selectedArticleItems = Array.from(selectedArticles)
      .map(id => allMinimalArticles.find(article => article.id === id))
      .filter(Boolean) as ArticleMinimalItem[];

    await startMultipleScraping({
      selectedArticles: selectedArticleItems,
      targetClass: targetClass.trim(),
      projectId,
      token,
    });
  };

  // ダイアログが閉じられた時の処理
  const handleDialogClose = (open: boolean) => {
    if (!open && !isScrapingInProgress) {
      setSelectedArticles(new Set());
      setTargetClass("");
    }
    onOpenChange(open);
  };

  // 進捗率の計算
  const progressPercentage = progressInfo?.processedPages 
    ? Math.min((progressInfo.processedPages / selectedArticles.size) * 100, 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-w-4xl">
        <DialogHeader>
          <DialogTitle>記事を選択してスクレイピング</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 対象クラス名入力 */}
          <div>
            <Label htmlFor="target-class">対象クラス名</Label>
            <Input
              id="target-class"
              placeholder="例: content-main, article-body"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              disabled={isScrapingInProgress}
            />
            <p className="text-sm text-muted-foreground mt-1">
              スクレイピング対象のHTML要素のクラス名を入力してください
            </p>
          </div>

          {/* 記事選択セクション */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>記事選択 ({selectedArticles.size}/10)</Label>
              {!isLoadingMinimalArticles && allMinimalArticles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isScrapingInProgress}
                >
                  {selectedArticles.size === Math.min(allMinimalArticles.length, 10) ? "全解除" : "全選択"}
                </Button>
              )}
            </div>

            {isLoadingMinimalArticles ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">記事一覧を読み込み中...</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                {allMinimalArticles.map((article) => (
                  <div key={article.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`article-${article.id}`}
                      checked={selectedArticles.has(article.id)}
                      onChange={(e) => {
                        handleArticleSelect(article.id, e.target.checked);
                      }}
                      disabled={isScrapingInProgress}
                      className="rounded"
                    />
                    <label
                      htmlFor={`article-${article.id}`}
                      className="text-sm flex-1 cursor-pointer truncate"
                      title={article.metaTitle || article.articleUrl}
                    >
                      {article.metaTitle || article.articleUrl}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingMinimalArticles && allMinimalArticles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                選択可能な記事がありません
              </p>
            )}
          </div>

          {/* 進捗表示 */}
          {isScrapingInProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>進捗状況</Label>
                <span className="text-sm text-muted-foreground">
                  {progressInfo?.processedPages || 0} / {selectedArticles.size}
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              {progressInfo?.message && (
                <p className="text-sm text-muted-foreground">{progressInfo.message}</p>
              )}
              {progressInfo?.elapsedTime && (
                <p className="text-sm text-muted-foreground">
                  経過時間: {Math.floor(progressInfo.elapsedTime / 1000)}秒
                </p>
              )}
            </div>
          )}

          {/* エラー表示 */}
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-2">
            {isScrapingInProgress ? (
              <Button
                variant="destructive"
                onClick={() => cancelScraping()}
              >
                中断
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleScraping}
                  disabled={selectedArticles.size === 0 || !targetClass.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  スクレイピング実行
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
