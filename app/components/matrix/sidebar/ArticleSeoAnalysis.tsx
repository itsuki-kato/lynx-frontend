import type { ArticleItem } from '~/types/article';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, AlertCircle, ArrowRight, Lightbulb, CheckCircle, Link } from "lucide-react";
import { useArticleAnalysis } from '~/hooks/use-article-analysis';

/**
 * 内部リンクのバランス状態を評価し、適切な色を返す
 */
const getBalanceColor = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

  // 発リンクと被リンクのバランスが良い場合は緑
  if (hasOutgoingLinks && hasIncomingLinks) {
    return "text-emerald-600";
  }
  // 発リンクのみある場合は黄色
  else if (hasOutgoingLinks && !hasIncomingLinks) {
    return "text-amber-600";
  }
  // 被リンクのみある場合も黄色
  else if (!hasOutgoingLinks && hasIncomingLinks) {
    return "text-amber-600";
  }
  // どちらもない場合は赤
  else {
    return "text-red-600";
  }
};

/**
 * 内部リンクの状態を評価し、適切なテキストを返す
 */
const getBalanceText = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

  if (hasOutgoingLinks && hasIncomingLinks) {
    return "良好（発リンクと被リンクの両方があります）";
  }
  else if (hasOutgoingLinks && !hasIncomingLinks) {
    return "要改善（発リンクのみで被リンクがありません）";
  }
  else if (!hasOutgoingLinks && hasIncomingLinks) {
    return "要改善（被リンクのみで発リンクがありません）";
  }
  else {
    return "孤立（発リンクも被リンクもありません）";
  }
};

/**
 * 記事の孤立状態を評価し、適切な色を返す
 */
const getIsolationColor = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

  if (!hasOutgoingLinks && !hasIncomingLinks) {
    return "text-red-600"; // 完全に孤立している場合は赤
  }
  else if (!hasOutgoingLinks || !hasIncomingLinks) {
    return "text-amber-600"; // 片方向のみリンクがある場合は黄色
  }
  else {
    return "text-emerald-600"; // 両方向にリンクがある場合は緑
  }
};

/**
 * 記事の孤立状態を評価し、適切なテキストを返す
 */
const getIsolationText = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

  if (!hasOutgoingLinks && !hasIncomingLinks) {
    return "完全に孤立しています（SEO改善が必要）";
  }
  else if (!hasOutgoingLinks) {
    return "発リンクがありません（他の記事へのリンクを追加すると良いでしょう）";
  }
  else if (!hasIncomingLinks) {
    return "被リンクがありません（他の記事からリンクされていません）";
  }
  else {
    return "孤立していません（良好な状態です）";
  }
};

/**
 * SEO観点での改善提案を生成する
 */
const getSeoSuggestions = (article: ArticleItem): string[] => {
  const suggestions: string[] = [];
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;

  // 内部リンクがない場合
  if (!hasOutgoingLinks) {
    suggestions.push("関連する他の記事へのリンクを追加することで、サイト内の回遊率向上が期待できます。");
  }

  // 被リンクがない場合
  if (!hasIncomingLinks) {
    suggestions.push("他の記事からこの記事へのリンクを増やすことで、この記事の重要性を検索エンジンにアピールできます。");
  }

  // リンク数が少ない場合
  const outgoingLinks = article.internalLinks?.length || 0;
  if (outgoingLinks > 0 && outgoingLinks < 3) {
    suggestions.push("内部リンク数が少ないため、関連コンテンツへのリンクをさらに追加すると良いでしょう。");
  }

  // nofollowリンクがある場合
  if (article.internalLinks?.some(link => !link.isFollow)) {
    suggestions.push("一部のリンクがnofollowになっています。内部リンクは基本的にfollowにすることをお勧めします。");
  }

  // 提案がない場合（良好な状態）
  if (suggestions.length === 0) {
    suggestions.push("内部リンク構造は良好です。現状を維持しましょう。");
  }

  return suggestions;
};

interface ArticleSeoAnalysisProps {
  article: ArticleItem;
  articleId?: string;
}

/**
 * 記事のSEO分析を表示するコンポーネント
 */
export function ArticleSeoAnalysis({ article, articleId }: ArticleSeoAnalysisProps) {
  // フックを呼び出す
  const { analysis, isLoading, error, analyzeArticle, hasData } = useArticleAnalysis();

  const handleAnalyzeClick = () => {
    if (articleId) {
      analyzeArticle(articleId);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI分析結果 */}
      <div>
        <Badge variant="outline" className="mb-3 border-indigo-500 text-indigo-500 inline-flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          AI SEO分析
        </Badge>
        {/* 分析実行ボタン */}
        {!isLoading && !hasData && !error && (
          <div className="bg-muted p-4 rounded-md text-center mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              この記事のSEO分析を実行しますか？
            </p>
            <Button onClick={handleAnalyzeClick} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              分析を実行
            </Button>
          </div>
        )}
        {/* ローディング・エラー・結果表示 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 bg-muted rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">AI分析を実行中...</p>
          </div>
        ) : error ? (
          <div className="bg-muted p-3 rounded-md mb-4">
            <p className="text-sm text-red-500">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              分析中にエラーが発生しました: {error}
            </p>
            <Button onClick={handleAnalyzeClick} variant="outline" size="sm" className="mt-2">
              再試行
            </Button>
          </div>
        ) : hasData && analysis ? (
          <div className="space-y-4">
            <div className="flex items-center bg-muted p-3 rounded-md">
              <div className="w-16 h-16 flex items-center justify-center">
                <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold">{analysis.overallScore}</span>
                  <span className="text-xs absolute bottom-0 right-0">/10</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium">SEOスコア</p>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
            </div>

            {/* 強み */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
                  強み
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <CheckCircle className="h-3 w-3 mr-2 text-green-500 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 弱み */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <ThumbsDown className="h-3 w-3 mr-1 text-amber-500" />
                  改善点
                </h4>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <AlertCircle className="h-3 w-3 mr-2 text-amber-500 mt-1 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 推奨事項 */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <Lightbulb className="h-3 w-3 mr-1 text-blue-500" />
                  推奨アクション
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <ArrowRight className="h-3 w-3 mr-2 text-blue-500 mt-1 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : !isLoading && !error && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              「分析を実行」ボタンを押してください。
            </p>
          </div>
        )}
      </div>

      {/* 基本的な内部リンク分析 */}
      <div>
        <Badge variant="outline" className="mb-3 border-cyan-500 text-cyan-500 inline-flex items-center">
          <Link className="h-4 w-4 mr-2" />
          内部リンク分析
        </Badge>
        <div className="bg-muted p-3 rounded-md">
          <ul className="space-y-2">
            {/* 内部リンクの状態に基づいた分析情報 */}
            <li className="text-sm">
              <span className="font-medium">内部リンク状態: </span>
              <span className={`${getBalanceColor(article)}`}>
                {getBalanceText(article)}
              </span>
            </li>
            <li className="text-sm">
              <span className="font-medium">孤立状態: </span>
              <span className={`${getIsolationColor(article)}`}>
                {getIsolationText(article)}
              </span>
            </li>
            <li className="text-sm">
              <span className="font-medium">リンク品質: </span>
              {article.internalLinks?.some(link => !link.isFollow) ? (
                <span className="text-amber-600">一部nofollowリンクがあります</span>
              ) : (
                <span className="text-emerald-600">すべてfollowリンクです</span>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div>
        <Badge variant="outline" className="mb-3 border-emerald-500 text-emerald-500 inline-flex items-center">
          <Lightbulb className="h-4 w-4 mr-2" />
          改善提案
        </Badge>
        <div className="bg-muted p-3 rounded-md">
          <ul className="space-y-2 text-sm list-disc list-inside">
            {getSeoSuggestions(article).map((suggestion, index) => (
              <li key={`suggestion-${index}`}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
