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
            "projects": [
              {
                "id": 1,
                "workspaceId": 1,
                "projectUrl": "https://example.com",
                "projectName": "マイプロジェクト",
                "description": "これはサンプルプロジェクトです",
                "lastAcquisitionDate": "2023-01-01T00:00:00.000Z",
                "createdAt": "2023-01-01T00:00:00.000Z",
                "updatedAt": "2023-01-01T00:00:00.000Z"
              },
              {
                "id": 2,
                "workspaceId": 1,
                "projectUrl": "https://another-example.com",
                "projectName": "別プロジェクト",
                "description": null,
                "lastAcquisitionDate": null,
                "createdAt": "2023-01-02T00:00:00.000Z",
                "updatedAt": "2023-01-02T00:00:00.000Z"
              }
            ]
          }
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** ユーザーが見つかりません。

---

## DTO定義

### `UserProfileDto`

`src/users/dto/user-profile.dto.ts` で定義されています。

| 名前          | 型                  | 説明                                          | 例 (上記JSON参照) |
| ------------- | ------------------- | --------------------------------------------- | ----------------- |
| id            | integer             | ユーザーID                                    | 1                 |
| email         | string              | メールアドレス                                | user@example.com  |
| name          | string              | ユーザー名                                    | テストユーザー    |
| workspaceId   | integer \| null     | ワークスペースID (存在しない場合はnull)        | 1                 |
| projects      | ProjectResponseDto[] | ユーザーに関連付けられたプロジェクトの配列    | (上記JSON参照)    |

### `ProjectResponseDto`

`src/project/dto/project-response.dto.ts` で定義されています。

| 名前                  | 型        | 説明                               | 例                        |
| --------------------- | --------- | ---------------------------------- | ------------------------- |
| id                    | integer   | プロジェクトID                     | 1                         |
| workspaceId           | integer   | ワークスペースID                   | 1                         |
| projectUrl            | string    | プロジェクトURL                    | https://example.com       |
| projectName           | string    | プロジェクト名                     | マイプロジェクト          |
| description           | string \| null | プロジェクトの説明                 | これはサンプルプロジェクトです |
| lastAcquisitionDate   | Date \| null   | 最終クロール日時                   | 2023-01-01T00:00:00.000Z  |
| createdAt             | Date      | 作成日時                           | 2023-01-01T00:00:00.000Z  |
| updatedAt             | Date      | 更新日時                           | 2023-01-01T00:00:00.000Z  |


```typescript
// src/users/dto/user-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from '../../project/dto/project-response.dto';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ユーザーID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'メールアドレス' })
  email: string;

  @ApiProperty({ example: 'テストユーザー', description: 'ユーザー名' })
  name: string;

  @ApiProperty({ example: 1, description: 'ワークスペースID', nullable: true })
  workspaceId: number | null;

  @ApiProperty({
    description: 'ユーザーに関連付けられたプロジェクトの配列',
    type: () => [ProjectResponseDto],
  })
  projects: ProjectResponseDto[];
}

// src/project/dto/project-response.dto.ts
// (ProjectResponseDtoの定義はここでは省略。必要であれば上記表を参照)
```
