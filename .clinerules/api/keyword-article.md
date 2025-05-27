# API仕様書 - Keyword-Article

## 認証

- すべてのエンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Keyword-Article API

### 1. キーワードと記事の関連付け

- **Method:** `POST`
- **Path:** `/keyword-article/:keywordId/link/:articleId`
- **概要:** 指定されたキーワードと記事を関連付けます。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `keywordId` (number, **required**): 関連付けるキーワードID
    - `articleId` (number, **required**): 関連付ける記事ID
- **リクエストボディ:** なし
- **レスポンス:**
    - **201 Created:** 関連付け成功
        - Content-Type: `application/json`
        - Schema: `KeywordArticleDto`
          ```json
          {
            "keywordId": 1,
            "articleId": 101,
            "createdAt": "2025-04-29T12:35:00.000Z",
            "updatedAt": "2025-04-29T12:35:00.000Z"
          }
          ```
    - **404 Not Found:** 指定されたキーワードIDまたは記事IDが存在しない
    - **409 Conflict:** 指定されたキーワードと記事の組み合わせが既に関連付けられている

### 2. キーワードと記事の関連付け解除

- **Method:** `DELETE`
- **Path:** `/keyword-article/:keywordId/unlink/:articleId`
- **概要:** 指定されたキーワードと記事の関連付けを解除します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `keywordId` (number, **required**): 関連付けを解除するキーワードID
    - `articleId` (number, **required**): 関連付けを解除する記事ID
- **リクエストボディ:** なし
- **レスポンス:**
    - **200 OK:** 関連付け解除成功
        - Content-Type: `application/json`
        - Schema: `KeywordArticleDto` (削除された関連付け情報)
    - **404 Not Found:** 指定されたキーワードIDと記事IDの関連付けが存在しない

---

## DTO定義

### `KeywordArticleDto`

```typescript
// src/keyword-article/dto/keyword-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { KeywordArticle } from '@prisma/client';

export class KeywordArticleDto implements KeywordArticle {
  @ApiProperty({ description: 'キーワードID', example: 1 })
  keywordId: number;

  @ApiProperty({ description: '記事ID', example: 101 })
  articleId: number;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
```

### `ArticleResponseDto`

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
