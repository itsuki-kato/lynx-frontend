import React from 'react';
import type { CrawlStatus, ProgressInfo } from '~/types/scraping';
import { Badge } from '~/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, Timer, FileText, Loader2 } from 'lucide-react'; // Loader2 をインポート
import { Progress } from '~/components/ui/progress'; // Progress をインポート
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'; // Alert コンポーネントをインポート

interface ScrapingStatusProps {
  crawlStatus: CrawlStatus;
  progressInfo: ProgressInfo | null;
  errorMessage: string | null;
}

/**
 * スクレイピングの状態表示コンポーネント
 * 内部リンクマトリクス画面のスタイルに合わせて再構築
 */
export function ScrapingStatus({ crawlStatus, progressInfo, errorMessage }: ScrapingStatusProps) {
  // ステータスに応じたバッジの表示
  const renderStatusBadge = () => {
    switch (crawlStatus) {
      case 'idle':
        return <Badge variant="outline">待機中</Badge>;
      case 'running':
        return <Badge variant="secondary" className="animate-pulse">処理中</Badge>;
      case 'completed':
        return <Badge variant="default">完了</Badge>;
      case 'error':
        return <Badge variant="destructive">エラー</Badge>;
      default:
        return null;
    }
  };

  // 実行前のアイドル状態の表示
  const renderIdleStatus = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm">
            フォームを入力して「サイト分析を開始する」ボタンを押してください。
          </p>
        </div>
      </div>
    </div>
  );

  // 進行状況表示
  const renderRunningStatus = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-start gap-3">
        <Loader2 className="animate-spin h-4 w-4 text-primary mt-0.5" /> {/* Loader2 アイコンに変更 */}
        <div className="flex-grow">
          <p className="text-sm font-medium">
            スクレイピング処理中です...
          </p>
          {progressInfo && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-muted-foreground">{progressInfo.message}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  処理済み: {progressInfo.processedPages}ページ
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  経過時間: {progressInfo.elapsedTime.toFixed(1)}秒
                </span>
              </div>
              {/* Progress コンポーネントを使用 */}
              <Progress value={100} className="h-1 w-full [&>*]:animate-pulse" /> 
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            このページを離れると処理が中断されます
          </p>
        </div>
      </div>
    </div>
  );

  // 完了メッセージ
  const renderCompletedStatus = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-start gap-3">
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium">
            スクレイピングが完了しました
          </p>
          {progressInfo && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="bg-muted/50 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">総処理ページ数</p>
                <p className="text-sm font-medium">{progressInfo.processedPages}</p>
              </div>
              <div className="bg-muted/50 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">総処理時間</p>
                <p className="text-sm font-medium">{progressInfo.elapsedTime.toFixed(1)}秒</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // エラーメッセージ - Alert コンポーネントを使用
  const renderErrorStatus = () => (
    errorMessage && (
      <Alert variant="destructive">
        <div className="flex items-center justify-between mb-2 w-full"> {/* w-full を追加 */}
          <AlertTitle className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> {/* アイコンをタイトル内に移動 */}
            スクレイピングステータス
          </AlertTitle>
          {renderStatusBadge()}
        </div>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )
  );

  return (
    <div className="w-full">
      {crawlStatus === 'idle' && renderIdleStatus()}
      {crawlStatus === 'running' && renderRunningStatus()}
      {crawlStatus === 'completed' && renderCompletedStatus()}
      {crawlStatus === 'error' && renderErrorStatus()}
    </div>
  );
}
