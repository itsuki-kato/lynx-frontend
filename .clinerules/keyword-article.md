# API仕様書 - Keyword-Article

## 認証

- 現状、このコントローラーのエンドポイントに認証はかかっていません。必要に応じて `JwtAuthGuard` などを追加してください。

---

## Keyword-Article API

### 1. キーワードと記事の関連付け

- **Method:** `POST`
- **Path:** `/keywords/:keywordId/articles/:articleId`
- **概要:** 指定されたキーワードと記事を関連付けます。
- **認証:** 不要 (現状)
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
- **Path:** `/keywords/:keywordId/articles/:articleId`
- **概要:** 指定されたキーワードと記事の関連付けを解除します。
- **認証:** 不要 (現状)
- **パスパラメータ:**
    - `keywordId` (number, **required**): 関連付けを解除するキーワードID
    - `articleId` (number, **required**): 関連付けを解除する記事ID
- **リクエストボディ:** なし
- **レスポンス:**
    - **200 OK:** 関連付け解除成功
        - Content-Type: `application/json`
        - Schema: `KeywordArticleDto` (削除された関連付け情報)
    - **404 Not Found:** 指定されたキーワードIDと記事IDの関連付けが存在しない

### 3. 指定キーワードに紐づく記事一覧取得

- **Method:** `GET`
- **Path:** `/keywords/:keywordId/articles`
- **概要:** 指定されたキーワードIDに紐づく記事の一覧を取得します。
- **認証:** 不要 (現状)
- **パスパラメータ:**
    - `keywordId` (number, **required**): 記事一覧を取得するキーワードID
- **リクエストボディ:** なし
- **レスポンス:**
    - **200 OK:** 記事一覧取得成功
        - Content-Type: `application/json`
        - Schema: `Array<ArticleResponseDto>`
          ```json
          [
            {
              "id": 101,
              "projectId": 1,
              "articleUrl": "https://example.com/article1",
              "metaTitle": "記事タイトル1",
              "metaDescription": "記事の説明1",
              "isIndexable": true,
              "headings": { "h1": ["見出し1"] }, // 例
              "jsonLd": { "@type": "Article" }, // 例
              "createdAt": "2025-04-29T12:30:00.000Z",
              "updatedAt": "2025-04-29T12:30:00.000Z"
            },
            {
              "id": 102,
              "projectId": 1,
              "articleUrl": "https://example.com/article2",
              "metaTitle": "記事タイトル2",
              "metaDescription": "記事の説明2",
              "isIndexable": false,
              "headings": null,
              "jsonLd": null,
              "createdAt": "2025-04-29T12:31:00.000Z",
              "updatedAt": "2025-04-29T12:31:00.000Z"
            }
          ]
          ```
    - **404 Not Found:** 指定されたキーワードIDが存在しない

### 4. 指定記事に紐づくキーワード一覧取得

- **Method:** `GET`
- **Path:** `/articles/:articleId/keywords`
- **概要:** 指定された記事IDに紐づくキーワードの一覧を取得します。
- **認証:** 不要 (現状)
- **パスパラメータ:**
    - `articleId` (number, **required**): キーワード一覧を取得する記事ID
- **リクエストボディ:** なし
- **レスポンス:**
    - **200 OK:** キーワード一覧取得成功
        - Content-Type: `application/json`
        - Schema: `Array<KeywordResponseDto>` (Note: This DTO definition is in keyword.md)
          ```json
          [
            {
              "id": 1,
              "projectId": 1,
              "keywordName": "キーワード1",
              "parentId": null,
              "level": 1,
              "searchVolume": 100,
              "difficulty": "中",
              "relevance": "〇",
              "searchIntent": "Informational",
              "importance": "高",
              "memo": "対策メモ1",
              "createdAt": "2025-04-29T12:35:00.000Z",
              "updatedAt": "2025-04-29T12:35:00.000Z",
              "parentKeyword": null, // KeywordResponseDto に合わせる
              "childKeywords": []    // KeywordResponseDto に合わせる
            },
            {
              "id": 2,
              "projectId": 1,
              "keywordName": "キーワード2",
              "parentId": 1,
              "level": 2,
              "searchVolume": 50,
              "difficulty": null,
              "relevance": null,
              "searchIntent": null,
              "importance": null,
              "memo": null,
              "createdAt": "2025-04-29T12:36:00.000Z",
              "updatedAt": "2025-04-29T12:36:00.000Z",
              "parentKeyword": null, // KeywordResponseDto に合わせる
              "childKeywords": []    // KeywordResponseDto に合わせる
            }
          ]
          ```
    - **404 Not Found:** 指定された記事IDが存在しない

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
