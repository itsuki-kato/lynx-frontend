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
        - Schema: `UserProfileDto`
          ```json
          {
            "id": 1,
            "email": "user@example.com",
            "name": "テストユーザー",
            "workspaceId": 1,
            "projectIds": [1, 2]
          }
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** ユーザーが見つかりません。

---

## DTO定義

### `UserProfileDto`

`src/users/dto/user-profile.dto.ts` で定義されています。

| 名前          | 型        | 説明                                   | 例             |
| ------------- | --------- | -------------------------------------- | -------------- |
| id            | integer   | ユーザーID                             | 1              |
| email         | string    | メールアドレス                         | user@example.com |
| name          | string    | ユーザー名                             | テストユーザー   |
| workspaceId   | integer \| null | ワークスペースID (存在しない場合はnull) | 1              |
| projectIds    | integer[] | プロジェクトIDの配列                   | [1, 2]         |

```typescript
// src/users/dto/user-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ユーザーID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'メールアドレス' })
  email: string;

  @ApiProperty({ example: 'テストユーザー', description: 'ユーザー名' })
  name: string;

  @ApiProperty({ example: 1, description: 'ワークスペースID', nullable: true })
  workspaceId: number | null;

  @ApiProperty({ example: [1, 2], description: 'プロジェクトIDの配列', type: [Number] })
  projectIds: number[];
}
