# API仕様書 - Auth

## 認証

- 各エンドポイントの認証要件は個別に記載します。

---

## Auth API (`/auth`)

### 1. Google OAuth認証開始

- **Method:** `GET`
- **Path:** `/auth/google`
- **概要:** Google OAuth認証プロセスを開始します。ユーザーはGoogleのログインページにリダイレクトされます。
- **認証:** 不要
- **リクエストボディ:** なし
- **レスポンス:**
    - **302 Found:** Googleの認証ページへのリダイレクト。

### 2. Google OAuthコールバック

- **Method:** `GET`
- **Path:** `/auth/google/callback`
- **概要:** Google OAuth認証成功後のコールバックエンドポイント。認証後、フロントエンドの指定URL（環境変数 `FRONTEND_URL` またはデフォルト `https://lynx-frontend.onrender.com/auth/success`）にアクセストークンとリフレッシュトークンをクエリパラメータとして付与してリダイレクトします。
- **認証:** Google OAuthによる認証（内部的に`AuthGuard('google')`を使用）
- **リクエストボディ:** なし
- **レスポンス:**
    - **302 Found:** フロントエンドの成功ページへのリダイレクト。
        - リダイレクト先URLの例: `https://lynx-frontend.onrender.com/auth/success?token=xxx&refreshToken=yyy`
    - **500 Internal Server Error:** 認証処理中にエラーが発生した場合。

### 3. トークンリフレッシュ

- **Method:** `POST`
- **Path:** `/auth/refresh`
- **概要:** 有効なリフレッシュトークンを使用して、新しいアクセストークンとリフレッシュトークンを取得します。
- **認証:** 不要（リフレッシュトークン自体が認証の役割を果たす）
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema:
      ```json
      {
        "refreshToken": "your_refresh_token_here"
      }
      ```
    - **フィールド:**
        - `refreshToken` (string, **required**): リフレッシュトークン
- **レスポンス:**
    - **200 OK:** トークンのリフレッシュ成功
        - Content-Type: `application/json`
        - Schema:
          ```json
          {
            "accessToken": "new_access_token",
            "refreshToken": "new_refresh_token"
          }
          ```
    - **400 Bad Request:** `refreshToken` が提供されていない、または無効な形式。
    - **401 Unauthorized:** 提供された `refreshToken` が無効または期限切れ。

---

## DTO定義

このコントローラーに直接関連するリクエスト/レスポンスDTOは上記の通りです。
関連する可能性のある `User` DTOは `user.md` を参照してください。
