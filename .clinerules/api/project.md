# API仕様書 - Projects

## 認証

- `/projects` エンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Projects API (`/projects`)

### 1. プロジェクト作成

- **Method:** `POST`
- **Path:** `/projects`
- **概要:** 新しいプロジェクトを作成します。リクエストしたユーザーに紐づくワークスペースが存在しない場合は、新しいワークスペースが自動的に作成され、プロジェクトはそのワークスペースに紐付けられます。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `CreateProjectDto`
      ```json
      {
        "projectUrl": "https://example.com",
        "projectName": "新しいプロジェクト",
        "description": "これは新しいプロジェクトの説明です。"
      }
      ```
    - **フィールド:**
        - `projectUrl` (string, **required**): 対象サイトのURL
        - `projectName` (string, **required**): プロジェクト名
        - `description` (string, *optional*): プロジェクトの説明
- **レスポンス:**
    - **201 Created:** プロジェクト作成成功
        - Content-Type: `application/json`
        - Schema: `ProjectResponseDto`
          ```json
          {
            "id": 1,
            "workspaceId": 1,
            "projectUrl": "https://example.com",
            "projectName": "新しいプロジェクト",
            "description": "これは新しいプロジェクトの説明です。",
            "lastAcquisitionDate": null,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'プロジェクトのURL',
    example: 'https://example.com',
  })
  @IsNotEmpty({ message: 'プロジェクトURLは必須です。' })
  @IsUrl({}, { message: '有効なURL形式で入力してください。' })
  projectUrl: string;

  @ApiProperty({
    description: 'プロジェクト名',
    example: 'マイブログ',
  })
  @IsNotEmpty({ message: 'プロジェクト名は必須です。' })
  @IsString({ message: 'プロジェクト名は文字列である必要があります。' })
  projectName: string;

  @ApiPropertyOptional({
    description: 'プロジェクトの説明（任意）',
    example: '日常の出来事を綴るブログです。',
  })
  @IsOptional()
  @IsString({ message: '説明は文字列である必要があります。' })
  description?: string;
}
```

### `ProjectResponseDto`

```typescript
// src/project/dto/project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '@prisma/client';

export class ProjectResponseDto implements Project {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  workspaceId: number;

  @ApiProperty({ example: 'https://example.com' })
  projectUrl: string;

  @ApiProperty({ example: 'マイプロジェクト' })
  projectName: string;

  @ApiProperty({ example: 'これはサンプルプロジェクトです', nullable: true })
  description: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', nullable: true })
  lastAcquisitionDate: Date | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
