import type { ArticleItem } from '~/types/article';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { X, Sparkles, Loader2, ThumbsUp, ThumbsDown, AlertCircle, ArrowRight, Lightbulb, CheckCircle } from "lucide-react";
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

interface ArticleDetailSidebarProps {
  article: ArticleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 記事詳細を表示するサイドバーコンポーネント
 * SEO観点での内部リンク分析情報も表示
 */
export default function ArticleDetailSidebar({ article, isOpen, onClose }: ArticleDetailSidebarProps) {
  if (!article) {
    return null; // 記事が選択されていない場合は何も表示しない
  }

  // フックを呼び出す (articleId は渡さない)
  const { analysis, isLoading, error, analyzeArticle, hasData } = useArticleAnalysis();

  // サイドバーが開かれたとき、または記事が変わったときに前の分析結果をクリアする
  // ※ useArticleAnalysis フック自体にリセット機能がないため、
  //   ここでは表示を制御することで対応（hasData フラグを利用）
  //   もし厳密なリセットが必要な場合はフック側の改修も検討

  const handleAnalyzeClick = () => {
    if (article?.id) {
      analyzeArticle(String(article.id));
    }
  };

  // article が null の場合は早期リターン
  if (!article) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[320px] sm:w-[400px] md:w-[480px] lg:w-[540px] bg-background/100 border-l border-border shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      {/* ヘッダー (スクロールしない部分) */}
      <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">記事詳細</h2>
          <p className="text-sm text-muted-foreground">
            選択された記事の情報を表示します。
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
      <div className="flex-grow overflow-y-auto"> {/* この div がスクロールを担当 */}
        <Tabs defaultValue="basic" className="flex flex-col h-full"> {/* h-full を追加 */}
          {/* タブリスト (スクロール時に追従) */}
          <div className="px-6 pt-4 sticky top-0 bg-background z-10 border-b">
            <TabsList className="grid grid-cols-3 w-full"> {/* w-full を追加 */}
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="links">内部リンク</TabsTrigger>
              <TabsTrigger value="seo">SEO分析</TabsTrigger>
            </TabsList>
          </div>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="px-6 pb-6 mt-4"> {/* mt-4 を追加, flex-grow, overflow-y-auto を削除 */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">タイトル</h3>
                <p className="text-sm text-muted-foreground">{article.metaTitle}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">URL</h3>
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {article.articleUrl}
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-1">ディスクリプション</h3>
                <p className="text-sm text-muted-foreground">{article.metaDescription || '未設定'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">見出し (H1)</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {article.headings?.filter(h => h.tag === 'h1').map((h, index) => (
                    <li key={`h1-${index}`}>{h.text}</li>
                  )) || <li>未設定</li>}
                </ul>
              </div>
              <div className="flex gap-4">
                <div>
                  <h3 className="font-semibold mb-1">発リンク</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground">{article.internalLinks?.length ?? 0} 件</p>
                    {article.internalLinks && article.internalLinks.length > 0 ? (
                      <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        リンクあり
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                        リンクなし
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">被リンク</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground">{article.linkedFrom?.length ?? 0} 件</p>
                    {article.linkedFrom && article.linkedFrom.length > 0 ? (
                      <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        リンクあり
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                        リンクなし
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 内部リンクタブ */}
          <TabsContent value="links" className="px-6 pb-6 mt-4"> {/* mt-4 を追加, flex-grow, overflow-y-auto を削除 */}
            <div className="space-y-6">
              {/* 発リンク（この記事から他の記事へのリンク） */}
              <div>
                <h3 className="font-semibold mb-2">発リンク（この記事から他の記事へのリンク）</h3>
                {article.internalLinks && article.internalLinks.length > 0 ? (
                  <ul className="space-y-3">
                    {article.internalLinks.map((link, index) => (
                      <li key={`outgoing-${index}`} className="border-b pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{link.anchorText || "リンクテキストなし"}</p>
                            <a
                              href={link.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline break-all"
                            >
                              {link.linkUrl}
                            </a>
                          </div>
                          <Badge variant={link.isFollow ? "default" : "outline"}>
                            {link.isFollow ? "follow" : "nofollow"}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">発リンクはありません</p>
                )}
              </div>

              {/* 被リンク（他の記事からこの記事へのリンク） */}
              <div>
                <h3 className="font-semibold mb-2">被リンク（他の記事からこの記事へのリンク）</h3>
                {article.linkedFrom && article.linkedFrom.length > 0 ? (
                  <ul className="space-y-3">
                    {article.linkedFrom.map((link, index) => {
                      // criteriaArticleIdから記事情報を取得（実際の実装ではAPIなどから取得）
                      const sourceArticleId = link.criteriaArticleId;
                      return (
                        <li key={`incoming-${index}`} className="border-b pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                記事ID: {sourceArticleId} からのリンク
                              </p>
                              <p className="text-xs text-muted-foreground">
                                アンカーテキスト: {link.anchorText || "リンクテキストなし"}
                              </p>
                            </div>
                            <Badge variant={link.isFollow ? "default" : "outline"}>
                              {link.isFollow ? "follow" : "nofollow"}
                            </Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">被リンクはありません</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SEO分析タブ */}
          <TabsContent value="seo" className="px-6 pb-6 mt-4"> {/* mt-4 を追加, flex-grow, overflow-y-auto を削除 */}
            <div className="space-y-4">
              {/* AI分析結果 */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  AI SEO分析
                </h3>

                {/* 分析実行ボタン */}
                {!isLoading && !hasData && !error && ( // ローディング中でなく、データがなく、エラーもない場合
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

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-muted rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">AI分析を実行中...</p>
                  </div>
                ) : error ? (
                  <div className="bg-muted p-3 rounded-md mb-4"> {/* エラー表示にもマージン追加 */}
                    <p className="text-sm text-red-500">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      分析中にエラーが発生しました: {error}
                    </p>
                    <Button onClick={handleAnalyzeClick} variant="outline" size="sm" className="mt-2">
                      再試行
                    </Button>
                  </div>
                ) : hasData && analysis ? ( // データがある場合のみ分析結果を表示
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
                ) : !isLoading && !error && ( // ローディング中でもエラーでもなく、データもない場合 (ボタン押下前)
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      「分析を実行」ボタンを押してください。
                    </p>
                  </div>
                )}
              </div>

              {/* 基本的な内部リンク分析 */}
              <div>
                <h3 className="font-semibold mb-2">内部リンク分析</h3>
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
                <h3 className="font-semibold mb-2">改善提案</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-2 text-sm list-disc list-inside">
                    {getSeoSuggestions(article).map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 基本的な内部リンク分析 */}
              <div>
                <h3 className="font-semibold mb-2">内部リンク分析</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-2">
                    {/* 内部リンクの状態に基づいた分析情報 */}
                    <li className="text-sm">
                      <span className="font-medium">内部リンク状態: </span>
                      <span className={`${getBalanceColor(article)}`}> {/* null チェック済み */}
                        {getBalanceText(article)} {/* null チェック済み */}
                      </span>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">孤立状態: </span>
                      <span className={`${getIsolationColor(article)}`}> {/* null チェック済み */}
                        {getIsolationText(article)} {/* null チェック済み */}
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
                <h3 className="font-semibold mb-2">改善提案</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-2 text-sm list-disc list-inside">
                    {getSeoSuggestions(article).map((suggestion, index) => ( /* null チェック済み */
                      <li key={`suggestion-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs> {/* Tabs の閉じタグ */}
      </div> {/* スクロール可能領域の閉じタグ */}

      {/* フッター (スクロールしない部分) */}
      <div className="p-6 border-t flex-shrink-0">
        <Button variant="outline" onClick={onClose} className="w-full">
          閉じる
        </Button>
      </div>
    </div>
  );
}
