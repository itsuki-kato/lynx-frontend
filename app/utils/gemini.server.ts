import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数からAPIキーを取得
// サーバーサイドでは直接process.env.GEMINI_API_KEYを使用する
// Viteの設定ではなく、実際の環境変数を使用する
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

/**
 * 記事の内部リンク構造を分析し、SEO改善提案を生成する
 */
export async function analyzeSeoWithGemini(articleData: any) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Geminiモデルの初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    // APIバージョンがv1betaではなくv1geminiになっている可能性があるため、モデル名を修正
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // プロンプトの構築
    const prompt = constructSeoAnalysisPrompt(articleData);
    
    // Gemini APIの呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 結果をパースして構造化データに変換
    return parseSeoAnalysisResponse(text);
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      error: true,
      message: error.message || 'AIによる分析中にエラーが発生しました',
    };
  }
}

/**
 * 記事データからSEO分析用のプロンプトを構築
 */
function constructSeoAnalysisPrompt(articleData: any) {
  if (articleData.isOverallAnalysis) {
    // サイト全体の分析用プロンプト
    return `
      あなたはSEOの専門家です。以下のサイト全体の内部リンク構造データを分析し、改善点を提案してください。
      
      総記事数: ${articleData.articleCount}
      孤立記事数（発リンクも被リンクもない）: ${articleData.isolatedCount}
      平均内部リンク密度（記事あたりの平均リンク数）: ${articleData.averageLinkDensity.toFixed(1)}
      発リンクがない記事数: ${articleData.noOutgoingCount}
      被リンクがない記事数: ${articleData.noIncomingCount}
      
      以下の形式でJSON形式で回答してください:
      {
        "overallScore": 1-10の数値で総合評価,
        "strengths": ["強み1", "強み2"],
        "weaknesses": ["弱み1", "弱み2"],
        "recommendations": ["提案1", "提案2", "提案3"],
        "summary": "全体的な分析の要約（100文字以内）"
      }
    `;
  } else {
    // 個別記事の分析用プロンプト
    return `
      あなたはSEOの専門家です。以下の記事データを分析し、内部リンク構造の改善点を提案してください。
      
      記事タイトル: ${articleData.metaTitle || '不明'}
      記事URL: ${articleData.articleUrl || '不明'}
      発リンク数: ${articleData.internalLinks?.length || 0}
      被リンク数: ${articleData.linkedFrom?.length || 0}
      
      発リンク先記事: ${articleData.internalLinks?.map((link: any) => link.linkUrl).join(', ') || 'なし'}
      
      以下の形式でJSON形式で回答してください:
      {
        "overallScore": 1-10の数値で総合評価,
        "strengths": ["強み1", "強み2"],
        "weaknesses": ["弱み1", "弱み2"],
        "recommendations": ["提案1", "提案2", "提案3"],
        "summary": "全体的な分析の要約（100文字以内）"
      }
    `;
  }
}

/**
 * Gemini APIからの応答をパースして構造化データに変換
 */
function parseSeoAnalysisResponse(responseText: string) {
  try {
    // JSONレスポンスをパース
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // JSONでない場合はテキストをそのまま返す
    return {
      summary: responseText,
      error: false,
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return {
      summary: responseText,
      error: true,
      message: 'AIレスポンスの解析に失敗しました',
    };
  }
}
