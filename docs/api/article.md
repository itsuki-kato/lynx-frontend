# API仕様書 - Articles

## 認証

- `/projects/:projectId/articles/minimal` エンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Articles API

### 1. プロジェクトに紐づく記事の最小限情報一覧取得

- **Method:** `GET`
- **Path:** `/projects/:projectId/articles/minimal`
- **概要:** 指定したプロジェクトIDに紐づく記事の最小限の情報（ID、URL、タイトル）を一覧で取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `projectId` (number, **required**): 記事一覧を取得するプロジェクトのID
- **レスポンス:**
    - **200 OK:** 記事一覧取得成功
        - Content-Type: `application/json`
        - Schema: `ArticleMinimalResponseDto[]`
          ```json
          [
            {
              "id": 101,
              "articleUrl": "https://example.com/article1",
              "metaTitle": "記事タイトル1"
            },
            {
              "id": 102,
              "articleUrl": "https://example.com/article2",
              "metaTitle": "記事タイトル2"
            }
          ]
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された`projectId`のプロジェクトが見つからない場合。

---

## DTO定義

### `ArticleMinimalResponseDto`

```typescript
// src/article/dto/article-minimal-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ArticleMinimalResponseDto {
  @ApiProperty({ description: '記事ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '記事URL',
    example: 'https://example.com/news/today-topic',
  })
  articleUrl: string;

  @ApiProperty({
    description: 'メタタイトル',
    example: '今日のトピック | Example News',
    nullable: true,
  })
  metaTitle: string | null;
}
```

### `ArticleResponseDto` (参考 - keyword-article.md より)

`keyword-article.md` で使用されている `ArticleResponseDto` も参考として記載します。
より詳細な記事情報を扱うエンドポイントが追加された場合、こちらを使用する可能性があります。

```typescript
// src/article/dto/article-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Article, Prisma } from '@prisma/client';

export class ArticleResponseDto implements Article {
  @ApiProperty({ description: '記事ID', example: 101 })
  id: number;

  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  projectId: number;

  @ApiProperty({
    description: '記事URL',
    example: 'https://example.com/article1',
  })
  articleUrl: string;

  @ApiProperty({ description: 'メタタイトル', example: '記事タイトル', nullable: true })
  metaTitle: string | null;

  @ApiProperty({
    description: 'メタディスクリプション',
    example: '記事の説明',
    nullable: true,
  })
  metaDescription: string | null;

  @ApiProperty({ description: 'インデックス可能か', example: true })
  isIndexable: boolean;

  @ApiProperty({ description: '見出し情報 (JSON)', type: 'object', nullable: true })
  headings: Prisma.JsonValue | null;

  @ApiProperty({ description: 'JSON-LD情報 (JSON)', type: 'object', nullable: true })
  jsonLd: Prisma.JsonValue | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
