import type { ActionFunctionArgs } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { analyzeSeoWithGemini } from "~/utils/gemini.server";
import type { ArticleItem } from "~/types/article";
import type { OverallSeoAnalysis } from "~/hooks/use-article-analysis";

/**
 * サイト全体のSEO分析を実行するAPIエンドポイント (リソースルート)
 * POSTリクエストでトリガーされる
 */
export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  try {
    // 記事データを取得
    const response = await fetch("http://localhost:3000/scraping/project/1", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error fetching articles: ${response.status}`);
    }

    const articles: ArticleItem[] = await response.json();

    // 全体的なSEO分析に必要なデータを計算
    const isolatedCount = articles.filter(a =>
      (a.internalLinks?.length || 0) === 0 &&
      (a.linkedFrom?.length || 0) === 0
    ).length;

    const noOutgoingCount = articles.filter(a =>
      (a.internalLinks?.length || 0) === 0
    ).length;

    const noIncomingCount = articles.filter(a =>
      (a.linkedFrom?.length || 0) === 0
    ).length;

    const totalLinks = articles.reduce((sum, a) =>
      sum + (a.internalLinks?.length || 0), 0
    );

    const averageLinkDensity = articles.length > 0
      ? totalLinks / articles.length
      : 0;

    // Gemini APIを使用して全体的なSEO分析を実行
    const overallAnalysis: OverallSeoAnalysis = await analyzeSeoWithGemini({
      isOverallAnalysis: true,
      articleCount: articles.length,
      isolatedCount,
      noOutgoingCount,
      noIncomingCount,
      averageLinkDensity,
    });

    // 成功レスポンスを返す (標準のResponseを使用)
    const successData = { success: true, analysis: overallAnalysis };
    return new Response(JSON.stringify(successData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Overall analysis API error:", error);
    const errorMessage = error instanceof Error ? error.message : "サイト全体の分析に失敗しました";
    // エラーレスポンスを返す (標準のResponseを使用)
    const errorData = {
        success: false,
        analysis: {
            error: true,
            message: errorMessage,
            // デフォルト値を設定
            overallScore: 0,
            strengths: [],
            weaknesses: [],
            recommendations: [],
            summary: "分析中にエラーが発生しました。"
        } as OverallSeoAnalysis // 型アサーション
    };
    return new Response(JSON.stringify(errorData), {
        status: 500,
        headers: {
            "Content-Type": "application/json",
        },
     });
  }
};

// このルートはAPIエンドポイントなので、デフォルトのReactコンポーネントは不要
export default function ApiAnalyzeOverall() {
  return null; // 何もレンダリングしない
}
