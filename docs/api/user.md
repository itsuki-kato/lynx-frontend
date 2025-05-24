# API仕様書 - User

## 認証

- `/user/me` エンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## User API (`/user`)

### 1. 認証ユーザー情報取得

- **Method:** `GET`
- **Path:** `/user/me`
- **概要:** 現在認証されているユーザー（アクセストークンに紐づくユーザー）の情報を取得します。
- **認証:** 必要 (Bearer Token - `AuthGuard('jwt')` を使用)
- **リクエストボディ:** なし
- **レスポンス:**
    - **200 OK:** ユーザー情報取得成功
        - Content-Type: `application/json`
        - Schema: `UserResponseDto` (仮。実際のレスポンスは `req.user` の内容に依存)
          ```json
          // AuthGuard('jwt') が返す req.user の内容に基づく想定
          {
            "id": 1,
            "email": "user@example.com",
            "name": "テスト ユーザー",
            "provider": "google", // または "email" など
            "providerId": "google_user_id_string", // Googleの場合
            "role": "USER", // "ADMIN" などもあり得る
            "createdAt": "2025-01-01T00:00:00.000Z",
            "updatedAt": "2025-01-01T00:00:00.000Z",
            "currentHashedRefreshToken": null // 通常レスポンスには含めないことが多い
            // workspaceId や activeWorkspaceId など、関連情報が含まれる可能性あり
          }
          ```
          **注意:** `req.user` の正確な型は `JwtStrategy` の `validate` メソッドの戻り値に依存します。上記は一般的なユーザー情報の例です。パスワードやリフレッシュトークンハッシュなどの機密情報は通常ここには含まれません。
    - **401 Unauthorized:** 認証トークンが無効または不足。

---

## DTO定義

### `UserResponseDto` (仮称)

`UserController` の `me` エンドポイントは、`AuthGuard('jwt')` によってリクエストオブジェクト (`req`) に挿入された `user` オブジェクトをそのまま返します。この `user` オブジェクトの正確な構造は、`JwtStrategy` の `validate` ペイロードの定義に依存します。

以下は、一般的なユーザー情報を表すレスポンスDTOの例です。実際のレスポンスには、これ以外のフィールドが含まれる、または一部が含まれない可能性があります。

```typescript
// 例: src/users/dto/user-response.dto.ts (もし作成する場合)
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client'; // PrismaのRole enumをインポート

export class UserResponseDto {
  @ApiProperty({ description: 'ユーザーID', example: 1 })
  id: number;

  @ApiProperty({ description: 'メールアドレス', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'ユーザー名', example: 'テスト ユーザー', nullable: true })
  name?: string | null;

  @ApiProperty({ description: '認証プロバイダー (google, emailなど)', example: 'google' })
  provider: string;

  @ApiProperty({ description: 'プロバイダー固有のID', example: '123456789012345678901', nullable: true })
  providerId?: string | null;

  @ApiProperty({ description: 'ユーザーロール', enum: Role, example: Role.USER })
  role: Role;

  // workspaceId, activeWorkspaceId など、アプリケーションの要件に応じて追加される可能性のあるフィールド
  // @ApiProperty({ description: '現在のワークスペースID', example: 1, nullable: true })
  // activeWorkspaceId?: number | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;

  // 注意: パスワードやリフレッシュトークンなどの機密情報はレスポンスに含めません。
}
