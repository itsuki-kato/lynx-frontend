# スクレイピング API 仕様書

本文書は、スクレイピングAPIのエンドポイント仕様を定義します。

## 1. 認証

当APIの利用には、Bearerトークンによる認証が必要です。

### 1.1. APIトークンの取得

APIトークンは、アプリケーションサーバーの環境変数 `API_TOKEN` に設定されています。

### 1.2. リクエストヘッダーへの指定

APIリクエストを行う際には、HTTPヘッダーに以下のようにトークンを指定してください。

```
Authorization: Bearer <YOUR_API_TOKEN>
```

`<YOUR_API_TOKEN>` の部分を、取得したAPIトークンに置き換えてください。

## 2. エンドポイント

### 2.1. 単一URLクロール (`/crawl/`)

指定された単一のURLから内部リンクをクロールし、指定されたCSSクラスを持つ要素の情報を収集します。

*   **HTTPメソッド**: `POST`
*   **パス**: `/crawl/`
*   **説明**: 指定されたURLを開始点として、サイト内の内部リンクを辿りながら情報を収集します。結果はNDJSON形式でストリーミング配信されます。
*   **リクエストヘッダー**:
    *   `Authorization`: `Bearer <YOUR_API_TOKEN>` (必須)
*   **リクエストボディ** (`application/json`):

    | パラメータ名   | 型     | 必須 | 説明                                   |
    | -------------- | ------ | ---- | -------------------------------------- |
    | `start_url`    | string | はい | クロールを開始するURL。                  |
    | `target_class` | string | はい | 収集対象のHTML要素のCSSクラス名。        |

    **リクエストボディ サンプル:**

    ```json
    {
        "start_url": "https://example.com/blog/article1",
        "target_class": "content-main"
    }
    ```

*   **レスポンス**:
    *   **成功時**:
        *   ステータスコード: `202 Accepted`
        *   レスポンスヘッダー:
            *   `X-Job-ID`: (string) 実行中のジョブの一意なID。
        *   レスポンスボディ (`application/x-ndjson`):
            スクレイピング結果がNDJSON形式でストリーミングされます。各行が1つのJSONオブジェクトです。
            **レスポンスボディ サンプル (1行の例):**
            ```json
            {
              "id": 237,
              "projectId": 2,
              "articleUrl": "https://lynx-seo.jp/blog/internal-link-check-tool-beta-manual/",
              "metaTitle": "【無料】内部リンクを可視化・管理できる内部リンクチェックツール",
              "metaDescription": "この記事では、内部リンクの有無・数・リンクテキスト等を可視化するための内部リンクチェックツールを無料で配布。スプレッドシートとGCPを活用することで、だれでも無料で利用できます。内部リンク管理に困っている人は、ぜひ活用してください。",
              "isIndexable": true,
              "headings": [
                {
                  "tag": "h1",
                  "text": "【無料】内部リンクを可視化・管理できる内部リンクチェックツール",
                  "children": [
                    {
                      "tag": "h2",
                      "text": "内部リンクチェックツール（β版）の概要",
                      "children": []
                    }
                  ]
                }
              ],
              "jsonLd": [
                []
              ],
              "createdAt": "2025-06-09T13:43:10.992Z",
              "updatedAt": "2025-06-09T13:43:10.992Z",
              "internalLinks": [
                {
                  "linkUrl": "https://lynx-seo.jp/#early-access-request",
                  "anchorText": "先行アクセス申込み",
                  "isFollow": true,
                  "status": {
                    "code": 200,
                    "redirectUrl": ""
                  }
                }
              ],
              "outerLinks": [
                {
                  "linkUrl": "https://console.cloud.google.com/",
                  "anchorText": "",
                  "isFollow": true,
                  "status": {
                    "code": 200,
                    "redirectUrl": ""
                  }
                }
              ]
            }
            ```
            *(注: 上記は提供されたサンプルを基にした構造です。実際のフィールドや値はスパイダーの実装や対象ページによって異なります。)*
    *   **エラー時**:
        *   ステータスコード:
            *   `401 Unauthorized`: 認証トークンが無効または指定されていません。
                ```json
                {
                    "detail": "Invalid or missing token"
                }
                ```
            *   `422 Unprocessable Entity`: リクエストボディの形式が不正です。
                ```json
                {
                    "detail": [
                        {
                            "loc": ["body", "start_url"],
                            "msg": "field required",
                            "type": "value_error.missing"
                        }
                    ]
                }
                ```
            *   `500 Internal Server Error`: サーバー内部でエラーが発生しました。
                ```json
                {
                    "detail": "Failed to start crawl job <job_id>: <error_details>"
                }
                ```

### 2.2. 複数URLスクレイプ (`/scrape_pages/`)

指定された複数のURLのコンテンツをスクレイピングし、指定されたCSSクラスを持つ要素の情報を収集します。

*   **HTTPメソッド**: `POST`
*   **パス**: `/scrape_pages/`
*   **説明**: 指定されたURLリストの各ページから情報を収集します。結果はNDJSON形式でストリーミング配信されます。
*   **リクエストヘッダー**:
    *   `Authorization`: `Bearer <YOUR_API_TOKEN>` (必須)
*   **リクエストボディ** (`application/json`):

    | パラメータ名   | 型           | 必須 | 説明                                   |
    | -------------- | ------------ | ---- | -------------------------------------- |
    | `start_urls`   | List[string] | はい | クロールを開始するURLのリスト。          |
    | `target_class` | string       | はい | 収集対象のHTML要素のCSSクラス名。        |

    **リクエストボディ サンプル:**

    ```json
    {
        "start_urls": ["https://example.com/page1", "https://example.com/page2"],
        "target_class": "product-details"
    }
    ```

*   **レスポンス**:
    *   **成功時**:
        *   ステータスコード: `202 Accepted`
        *   レスポンスヘッダー:
            *   `X-Job-ID`: (string) 実行中のジョブの一意なID。
        *   レスポンスボディ (`application/x-ndjson`):
            スクレイピング結果がNDJSON形式でストリーミングされます。各行が1つのJSONオブジェクトです。
            **レスポンスボディ サンプル (1行の例):**
            ```json
            {
              "id": 237,
              "projectId": 2,
              "articleUrl": "https://lynx-seo.jp/blog/internal-link-check-tool-beta-manual/",
              "metaTitle": "【無料】内部リンクを可視化・管理できる内部リンクチェックツール",
              "metaDescription": "この記事では、内部リンクの有無・数・リンクテキスト等を可視化するための内部リンクチェックツールを無料で配布。スプレッドシートとGCPを活用することで、だれでも無料で利用できます。内部リンク管理に困っている人は、ぜひ活用してください。",
              "isIndexable": true,
              "headings": [
                {
                  "tag": "h1",
                  "text": "【無料】内部リンクを可視化・管理できる内部リンクチェックツール",
                  "children": [
                    {
                      "tag": "h2",
                      "text": "内部リンクチェックツール（β版）の概要",
                      "children": []
                    }
                  ]
                }
              ],
              "jsonLd": [
                []
              ],
              "createdAt": "2025-06-09T13:43:10.992Z",
              "updatedAt": "2025-06-09T13:43:10.992Z",
              "internalLinks": [
                {
                  "linkUrl": "https://lynx-seo.jp/#early-access-request",
                  "anchorText": "先行アクセス申込み",
                  "isFollow": true,
                  "status": {
                    "code": 200,
                    "redirectUrl": ""
                  }
                }
              ],
              "outerLinks": [
                {
                  "linkUrl": "https://console.cloud.google.com/",
                  "anchorText": "",
                  "isFollow": true,
                  "status": {
                    "code": 200,
                    "redirectUrl": ""
                  }
                }
              ]
            }
            ```
            *(注: 上記は提供されたサンプルを基にした構造です。実際のフィールドや値はスパイダーの実装や対象ページによって異なります。)*
    *   **エラー時**:
        *   ステータスコード:
            *   `401 Unauthorized`: 認証トークンが無効または指定されていません。
            *   `422 Unprocessable Entity`: リクエストボディの形式が不正です。
            *   `500 Internal Server Error`: サーバー内部でエラーが発生しました。
            *(エラーレスポンスの形式は `/crawl/` と同様です)*

### 2.3. クロールジョブ停止 (`/crawl/stop/{job_id}`)

実行中のスクレイピングジョブを停止します。

*   **HTTPメソッド**: `POST`
*   **パス**: `/crawl/stop/{job_id}`
*   **説明**: 指定されたジョブIDに対応するスクレイピングプロセスを停止します。
*   **リクエストヘッダー**:
    *   `Authorization`: `Bearer <YOUR_API_TOKEN>` (必須)
*   **パスパラメータ**:

    | パラメータ名 | 型     | 必須 | 説明                   |
    | ------------ | ------ | ---- | ---------------------- |
    | `job_id`     | string | はい | 停止するジョブのID。   |

*   **レスポンス**:
    *   **成功時**:
        *   ステータスコード: `200 OK`
        *   レスポンスボディ (`application/json`):
            ```json
            {
                "message": "Stop signal sent to job <job_id>. It may take a moment to fully stop."
            }
            ```
    *   **エラー時**:
        *   ステータスコード:
            *   `401 Unauthorized`: 認証トークンが無効または指定されていません。
            *   `404 Not Found`: 指定されたジョブIDが見つからない、または既に完了しています。
                ```json
                {
                    "detail": "Job <job_id> not found or already completed."
                }
                ```
            *   `500 Internal Server Error`: ジョブの停止に失敗しました。
                ```json
                {
                    "detail": "Failed to stop job <job_id>: <error_details>"
                }
                ```

## 3. NDJSON (Newline Delimited JSON) 形式について

ストリーミングされるレスポンスデータはNDJSON形式です。これは、各JSONオブジェクトが改行文字 (`\n`) によって区切られているテキストベースの形式です。クライアントはレスポンスを1行ずつ読み込み、各行を独立したJSONオブジェクトとしてパースできます。

例:
```
{"key1": "value1", "key2": 123}
{"key1": "value2", "key2": 456}
...
```

## 4. ジョブ管理

`/crawl/` および `/scrape_pages/` エンドポイントは、リクエストを受け付けるとジョブID (`X-Job-ID` ヘッダー) を返します。このIDを使用して、必要に応じて `/crawl/stop/{job_id}` エンドポイントでジョブを停止できます。
