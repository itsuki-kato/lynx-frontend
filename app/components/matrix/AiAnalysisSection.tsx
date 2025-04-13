import React, { useState, useCallback } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Sparkles, Loader2, Copy } from 'lucide-react';
import type { OverallSeoAnalysis } from '~/hooks/use-article-analysis'; // 型をインポート
import { useToast } from '~/hooks/use-toast';

interface AiAnalysisSectionProps {
  runAnalysis: () => void; // 分析実行関数 (Promise<void> から void へ変更)
  analysisResult: OverallSeoAnalysis | null; // 分析結果
  isLoading: boolean; // ローディング状態
  error: string | undefined; // エラーメッセージ (フックから渡される)
}

/**
 * AI分析の実行ボタンと結果表示ポップアップを提供するコンポーネント
 */
export default function AiAnalysisSection({
  runAnalysis,
  analysisResult,
  isLoading,
}: AiAnalysisSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // 分析実行ハンドラー
  const handleRunAnalysis = () => {
    try {
      runAnalysis();
      // 分析成功後、結果があればダイアログを開く
      // analysisResultはrunAnalysis内で更新される想定
      // ここでは直接チェックせず、isLoadingの完了を待つ
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        title: "エラー",
        description: "AI分析の実行に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // isLoadingがfalseになり、analysisResultが存在する場合にダイアログを開く
  React.useEffect(() => {
    if (!isLoading && analysisResult) {
      setIsDialogOpen(true);
    }
  }, [isLoading, analysisResult]);


  // レポートコピーハンドラー
  const handleCopyReport = useCallback(() => {
    if (!analysisResult) return;

    const reportText = `
AI SEO分析レポート
====================

総合評価: ${analysisResult.overallScore} / 10

概要:
${analysisResult.summary}

おすすめの改善点:
${analysisResult.recommendations?.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n') || 'なし'}
    `.trim();

    navigator.clipboard.writeText(reportText)
      .then(() => {
        toast({
          title: "成功",
          description: "レポートをクリップボードにコピーしました。",
        });
      })
      .catch(err => {
        console.error("Failed to copy report:", err);
        toast({
          title: "エラー",
          description: "レポートのコピーに失敗しました。",
          variant: "destructive",
        });
      });
  }, [analysisResult, toast]);

  return (
    <>
      {/* AI分析実行ボタン */}
      <Button onClick={handleRunAnalysis} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        AI SEO分析を実行
      </Button>

      {/* 結果表示ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              AI SEO分析レポート
            </DialogTitle>
            <DialogDescription>
              Gemini AIによる内部リンク構造の分析結果です。
            </DialogDescription>
          </DialogHeader>
          {analysisResult && (
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* 総合評価 */}
              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <p className="text-lg font-semibold">総合評価</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold mr-1">{analysisResult.overallScore}</span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
              </div>

              {/* 概要 */}
              <div>
                <h3 className="text-md font-semibold mb-2">概要</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysisResult.summary}
                </p>
              </div>

              {/* おすすめの改善点 */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2">おすすめの改善点</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={handleCopyReport} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              レポートをコピー
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                閉じる
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
