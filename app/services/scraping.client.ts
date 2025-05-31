import type { StartScrapingParams as ExternalStartScrapingParams } from "~/types/scraping"; // 型をインポート

/**
 * スクレイピングAPIクライアント
 */

// StartScrapingParams を外部の型定義に合わせる
interface StartScrapingParams extends ExternalStartScrapingParams {
  token?: string | null;
  signal?: AbortSignal;
}

/**
 * スクレイピング開始APIを呼び出す
 * @param params - API呼び出しに必要なパラメータ
 * @returns fetchのレスポンスオブジェクト
 * @throws APIエラー時にErrorをスロー
 */
export const startScrapingApi = async ({
  startUrl,
  targetClass,
  token,
  signal,
}: StartScrapingParams): Promise<Response> => {
  // 環境変数からAPIのベースURLを取得（デフォルトは相対パス）
  const apiBaseUrl = import.meta.env.SCRAPY_API_BASE_URL || "";

  // 完全なURLを構築
  const apiUrl = `${apiBaseUrl}/crawl/`;

  console.log("Calling startScrapingApi with:", {
    startUrl,
    targetClass,
    apiUrl,
  });
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      start_url: startUrl,
      target_class: targetClass,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = `APIエラー: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      if (errorText) errorDetail += ` - ${errorText}`;
    }
    console.error("startScrapingApi failed:", errorDetail);
    throw new Error(errorDetail);
  }

  console.log("startScrapingApi successful");
  return response;
};

interface CancelScrapingParams {
  jobId: string;
}

/**
 * スクレイピング中断APIを呼び出す
 * @param params - API呼び出しに必要なパラメータ (jobId)
 * @returns fetchのレスポンスオブジェクト
 * @throws APIエラー時にErrorをスロー
 */
export const cancelScrapingApi = async ({
  jobId,
}: CancelScrapingParams): Promise<Response> => {
  // 環境変数からAPIのベースURLを取得（デフォルトは相対パス）
  const apiBaseUrl = import.meta.env.SCRAPY_API_BASE_URL || "";

  // 完全なURLを構築
  const apiUrl = `${apiBaseUrl}/crawl/stop/${jobId}`;

  console.log(`Calling cancelScrapingApi for job: ${jobId} at ${apiUrl}`);
  const response = await fetch(apiUrl, {
    method: "POST",
  });

  // 中断APIは失敗してもエラーをスローしない（UI側でToast表示するため）
  // 必要に応じてエラーハンドリングを追加
  if (!response.ok) {
    console.warn(
      `cancelScrapingApi request failed for job ${jobId}: ${response.status}`
    );
    // エラーレスポンスの内容もログに出力しておく
    try {
      const errorResult = await response.clone().json(); // cloneしないと再度json()できない
      console.warn("Cancel API error response:", errorResult);
    } catch (e) {
      console.warn("Could not parse cancel API error response as JSON.");
    }
  } else {
    console.log(`cancelScrapingApi successful for job: ${jobId}`);
  }

  return response;
};
