# API仕様書 - Projects

## 認証

- `/projects` エンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Projects API (`/projects`)

### 1. プロジェクト作成

- **Method:** `POST`
- **Path:** `/projects`
- **概要:** 新しいプロジェクトを作成します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `CreateProjectDto`
      ```json
      {
        "projectName": "新しいプロジェクト",
        "siteUrl": "https://example.com"
      }
      ```
    - **フィールド:**
        - `projectName` (string, **required**): プロジェクト名
        - `siteUrl` (string, **required**): 対象サイトのURL
- **レスポンス:**
    - **201 Created:** プロジェクト作成成功
        - Content-Type: `application/json`
        - Schema: `ProjectResponseDto`
          ```json
          {
            "id": 1,
            "workspaceId": 1, // ユーザーに紐づくワークスペースID
            "projectName": "新しいプロジェクト",
            "siteUrl": "https://example.com",
            "createdAt": "2025-05-24T12:00:00.000Z",
            "updatedAt": "2025-05-24T12:00:00.000Z"
          }
          ```
    - **400 Bad Request:** リクエストボディのバリデーションエラー。
    - **401 Unauthorized:** 認証トークンが無効または不足。

---

## DTO定義

### `CreateProjectDto`

```typescript
// src/project/dto/create-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'プロジェクト名',
    example: 'My Awesome Project',
  })
  @IsString({ message: 'プロジェクト名は文字列である必要があります。' })
  @IsNotEmpty({ message: 'プロジェクト名は必須です。' })
  projectName: string;

  @ApiProperty({
    description: 'サイトURL',
    example: 'https://example.com',
  })
  @IsUrl({}, { message: '有効なURL形式である必要があります。' })
  @IsNotEmpty({ message: 'サイトURLは必須です。' })
  siteUrl: string;

  // workspaceId はリクエストボディに含めず、認証されたユーザーから取得するため、DTOからは削除されています。
}
```

### `ProjectResponseDto`

```typescript
// src/project/dto/project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';

export class ProjectResponseDto implements Project {
  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  id: number;

  @ApiProperty({ description: 'ワークスペースID', example: 1 })
  workspaceId: number;

  @ApiProperty({ description: 'プロジェクト名', example: 'My Awesome Project' })
  projectName: string;

  @ApiProperty({ description: 'サイトURL', example: 'https://example.com' })
  siteUrl: string;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
