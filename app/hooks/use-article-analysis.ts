import { useFetcher } from 'react-router';
import { useCallback } from 'react'; // useCallback をインポート
import type { ArticleItem } from '~/types/article';

export interface SeoAnalysisResult {
  overallScore: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  summary: string;
  error?: boolean;
  message?: string;
}

/**
 * 記事のSEO分析を行うためのフック
 */
export function useArticleAnalysis() { // articleId を引数から削除
  const fetcher = useFetcher<{ success: boolean; analysis: SeoAnalysisResult }>();

  // useEffect を削除

  // 分析を実行する関数
  const analyzeArticle = useCallback((articleId: string) => {
    if (fetcher.state === 'idle') { // 実行中でなければ実行
      fetcher.submit(
        { articleId },
        { method: 'post', action: '/internal-link-matrix' }
      );
    }
  }, [fetcher]);

  return {
    analysis: fetcher.data?.analysis,
    isLoading: fetcher.state !== 'idle',
    error: fetcher.data?.success === false ? fetcher.data?.analysis?.message : undefined,
    analyzeArticle, // 関数を返す
    hasData: fetcher.data !== undefined // データがあるかどうかを示すフラグを追加
  };
}

/**
 * サイト全体のSEO分析結果の型
 */
export interface OverallSeoAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
  error?: boolean;
  message?: string;
}
