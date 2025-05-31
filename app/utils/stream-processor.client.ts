import type { ArticleItem } from "~/types/article";
import type { ProgressInfo } from "~/types/scraping";

/**
 * ストリームイベントのコールバック関数の型定義
 */
interface StreamCallbacks {
  onStatus: (message: string) => void;
  onProgress: (progress: ProgressInfo) => void;
  onData: (article: ArticleItem) => void;
  onCompletion: (completionInfo: {
    message: string;
    processedPages: number;
    elapsedTime: number;
  }) => void;
  onError: (error: string) => void;
  onStreamEnd?: () => void; // ストリームが予期せず終了した場合のコールバック (オプション)
}

/**
 * APIからのレスポンスストリームを処理する
 * @param reader - ReadableStreamDefaultReader
 * @param callbacks - 各イベントタイプに対応するコールバック関数
 */
export const processScrapingStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks: StreamCallbacks
): Promise<void> => {
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedCompletionOrError = false; // 完了またはエラーメッセージを受け取ったか

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // ストリーム終了時に残っているバッファを処理
        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer.trim());
            // 最後のデータ処理
            if (json.type === "completion") {
              callbacks.onCompletion({
                message: json.message,
                processedPages: json.processed_pages,
                elapsedTime: json.total_time,
              });
              receivedCompletionOrError = true;
            } else if (
              !json.type &&
              typeof json === "object" &&
              json !== null &&
              "articleUrl" in json
            ) {
              callbacks.onData(json as ArticleItem);
            } else if (json.error) {
              callbacks.onError(`スクレイピングエラー: ${json.error}`);
              receivedCompletionOrError = true;
            }
          } catch (e) {
            console.error("Error parsing final JSON chunk:", e, buffer);
            callbacks.onError(`レスポンスの最終チャンク解析エラー: ${buffer}`);
            receivedCompletionOrError = true;
          }
        }
        // 完了/エラーメッセージなしでストリームが終了した場合
        if (!receivedCompletionOrError && callbacks.onStreamEnd) {
          console.warn(
            "Stream ended unexpectedly without completion/error message."
          );
          callbacks.onStreamEnd();
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 最後の不完全な行をバッファに残す

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line.trim());

          // データタイプに応じてコールバックを呼び出し
          if (json.type === "status") {
            callbacks.onStatus(json.message);
          } else if (json.type === "progress") {
            callbacks.onProgress({
              message: json.message,
              processedPages: json.processed_pages,
              elapsedTime: json.elapsed_time,
            });
          } else if (json.type === "completion") {
            callbacks.onCompletion({
              message: json.message,
              processedPages: json.processed_pages,
              elapsedTime: json.total_time,
            });
            receivedCompletionOrError = true;
            break; // 完了したらループを抜ける
          } else if (json.error) {
            callbacks.onError(`スクレイピングエラー: ${json.error}`);
            receivedCompletionOrError = true;
            break; // エラーが発生したらループを抜ける
          } else if (
            !json.type &&
            typeof json === "object" &&
            json !== null &&
            "articleUrl" in json
          ) {
            // ArticleItem 型であることを確認 (より厳密なチェックも可能)
            callbacks.onData(json as ArticleItem);
          } else {
            console.warn("Unknown JSON structure received:", json);
          }
        } catch (e) {
          console.error("Error parsing JSON line:", e, line);
          callbacks.onError(
            `レスポンスの解析中にエラーが発生しました: ${line}`
          );
          receivedCompletionOrError = true;
          break; // 解析エラーが発生したらループを抜ける
        }
      }
      // 完了またはエラーを受け取ったら外側のループも抜ける
      if (receivedCompletionOrError) break;
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    callbacks.onError(
      error instanceof Error
        ? error.message
        : "ストリームの読み取り中に予期せぬエラーが発生しました"
    );
  }
};
