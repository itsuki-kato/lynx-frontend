# API仕様書 - Articles

## 認証

- すべての `/articles` エンドポイントへのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Articles API

### 1. 記事情報の一括作成・更新

- **Method:** `POST`
- **Path:** `/articles/bulk`
- **概要:** スクレイピング結果などの記事情報を一括でデータベースに保存（既存データは削除後、新規作成）します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `BulkCreateArticlesDto`
      ```json
      {
        "projectId": 1,
        "articles": [
          {
            "articleUrl": "https://example.com/article1",
            "metaTitle": "記事タイトル1",
            "metaDescription": "記事1のディスクリプション",
            "isIndexable": true,
            "internalLinks": [
              {
                "linkUrl": "https://example.com/article2",
                "anchorText": "関連記事2へ",
                "isFollow": true,
                "status": { "code": 200 }
              }
            ],
            "outerLinks": [
              {
                "linkUrl": "https://external-site.com/resource",
                "anchorText": "外部リソース",
                "isFollow": false,
                "status": { "code": 200 }
              }
            ],
            "headings": [
              { "tag": "h1", "text": "メインタイトル" },
              { "tag": "h2", "text": "サブタイトル1", "children": [{ "tag": "h3", "text": "詳細1" }] }
            ],
            "jsonLd": [ { "@context": "https://schema.org", "@type": "Article" } ]
          }
        ]
      }
      ```
- **レスポンス:**
    - **201 Created:** 記事の一括作成・更新成功
        - Content-Type: `application/json`
        - Schema: `ArticleCreationStats` (統計情報)
          ```json
          {
            "articlesDeleted": 5,
            "articlesCreated": 10,
            "innerLinksCreated": 25,
            "outerLinksCreated": 8,
            "headingsCreated": 50
          }
          ```
    - **400 Bad Request:** リクエストボディの形式が不正な場合。
    - **401 Unauthorized:** 認証トークンが無効または不足。

### 2. プロジェクトに紐づく記事の最小限情報一覧取得

- **Method:** `GET`
- **Path:** `/articles/project/:projectId/minimal`
- **概要:** 指定したプロジェクトIDに紐づく記事の最小限の情報（ID、URL、タイトル、関連キーワード）を一覧で取得します。
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
            }
          ]
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された`projectId`のプロジェクトが見つからない場合。

### 3. プロジェクトに紐づく記事の詳細情報一覧取得

- **Method:** `GET`
- **Path:** `/articles/project/:projectId/detailed`
- **概要:** 指定したプロジェクトIDに紐づく記事の詳細情報（リンク、見出し等を含む）を一覧で取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `projectId` (number, **required**): 記事一覧を取得するプロジェクトのID
- **レスポンス:**
    - **200 OK:** 記事一覧取得成功
        - Content-Type: `application/json`
        - Schema: `ArticleResponseDto[]` (詳細はDTO定義参照)
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された`projectId`のプロジェクトが見つからない場合。

### 4. 指定したIDの記事の詳細情報取得

- **Method:** `GET`
- **Path:** `/articles/:id/detailed`
- **概要:** 指定した記事IDの記事の詳細情報（リンク、見出し等を含む）を取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `id` (number, **required**): 記事ID
- **レスポンス:**
    - **200 OK:** 記事取得成功
        - Content-Type: `application/json`
        - Schema: `ArticleResponseDto` (詳細はDTO定義参照)
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された`id`の記事が見つからない場合。

### 5. プロジェクトに紐づく記事のページネーション取得 (フィード形式)

- **Method:** `GET`
- **Path:** `/articles/project/:projectId/feed`
- **概要:** 指定したプロジェクトIDに紐づく記事をページネーション形式で取得します。「もっと見る」機能のような、連続的なデータ読み込みに適しています。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `projectId` (number, **required**): 記事一覧を取得するプロジェクトのID
- **クエリパラメータ:**
    - `take` (number, optional, default: 20): 一度に取得する記事の件数。
    - `cursor` (number, optional): 前回のレスポンスで返された `nextCursor` の値（記事ID）。初回リクエスト時は指定しません。
- **レスポンス:**
    - **200 OK:** ページネーションされた記事一覧取得成功
        - Content-Type: `application/json`
        - Schema: `PaginatedArticlesResponseDto`
          ```json
          {
            "articles": [
              // ArticleResponseDto の配列 (詳細はDTO定義参照)
              {
                "id": 102,
                "projectId": 1,
                "articleUrl": "https://example.com/article102",
                "metaTitle": "記事タイトル102",
                // ... その他の ArticleResponseDto のフィールド
              },
              {
                "id": 101,
                "projectId": 1,
                "articleUrl": "https://example.com/article101",
                "metaTitle": "記事タイトル101",
                // ... その他の ArticleResponseDto のフィールド
              }
            ],
            "hasNextPage": true,
            "nextCursor": "100" // 次のリクエストで使用する記事ID (文字列)
          }
          ```
    - **400 Bad Request:** クエリパラメータの型が不正な場合 (例: `take` や `cursor` が数値でない)。
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された`projectId`のプロジェクトが見つからない場合。

---

## DTO定義

### `BulkCreateArticlesDto`

```typescript
// src/article/dto/bulk-create-articles.dto.ts
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// LinkStatusDto, InternalLinkDto, OuterLinkDto, HeadingDto, CreateArticleDetailDto の定義は省略 (上記参照)

export class BulkCreateArticlesDto {
  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  projectId: number;
  
  @ApiProperty({ type: () => [CreateArticleDetailDto] }) // Swaggerのために型情報を追加
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleDetailDto)
  articles: CreateArticleDetailDto[];
}
```

### `CreateArticleDetailDto` (BulkCreateArticlesDto内で使用)

```typescript
// src/article/dto/bulk-create-articles.dto.ts (一部)
export class CreateArticleDetailDto {
  @ApiProperty({ example: 'https://example.com/article-url' })
  articleUrl: string;

  @ApiProperty({ example: '記事のメタタイトル' })
  metaTitle: string;

  @ApiProperty({ example: '記事のメタディスクリプション' })
  metaDescription: string;

  @ApiProperty({ example: true })
  isIndexable: boolean;

  @ApiProperty({ type: () => [InternalLinkDto] })
  internalLinks: InternalLinkDto[];

  @ApiProperty({ type: () => [OuterLinkDto] })
  outerLinks: OuterLinkDto[];

  @ApiProperty({ type: () => [HeadingDto] })
  headings: HeadingDto[];

  @ApiProperty({ type: 'array', items: { type: 'object' }, nullable: true, example: [{ "@context": "https://schema.org" }] })
  jsonLd?: any[];
}
```
### `LinkStatusDto`, `InternalLinkDto`, `OuterLinkDto`, `HeadingDto`
これらのDTOは `bulk-create-articles.dto.ts` 内で定義されており、`CreateArticleDetailDto` によってネストして使用されます。詳細な定義は `src/article/dto/bulk-create-articles.dto.ts` を参照してください。

### `ArticleCreationStats`

```typescript
// src/article/dao/article.dao.ts (インターフェース定義)
export interface ArticleCreationStats {
  @ApiProperty({ description: '削除された記事数', example: 5 })
  articlesDeleted: number;
  @ApiProperty({ description: '作成された記事数', example: 10 })
  articlesCreated: number;
  @ApiProperty({ description: '作成された内部リンク数', example: 25 })
  innerLinksCreated: number;
  @ApiProperty({ description: '作成された外部リンク数', example: 8 })
  outerLinksCreated: number;
  @ApiProperty({ description: '作成/カウントされた見出し数', example: 50 })
  headingsCreated: number;
}
```

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

### `ArticleResponseDto`

`ArticleResponseDto` は記事の詳細情報を扱う際に使用されます。
DTO定義の詳細は `src/article/dto/article-response.dto.ts` を参照してください。

### `ListPaginatedArticlesDto` (クエリパラメータ用)

```typescript
// src/article/dto/list-paginated-articles.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListPaginatedArticlesDto {
  @ApiPropertyOptional({
    description: '前回のレスポンスで返されたカーソル (記事ID)',
    type: Number,
    example: 101,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cursor?: number;

  @ApiProperty({
    description: '取得件数',
    type: Number,
    default: 20,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take: number = 20;
}
```

### `PaginatedArticlesResponseDto` (レスポンス用)

```typescript
// src/article/dto/paginated-articles-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from './article-response.dto';

export class PaginatedArticlesResponseDto {
  @ApiProperty({
    type: () => [ArticleResponseDto],
    description: '記事の配列',
  })
  articles: ArticleResponseDto[];

  @ApiProperty({ description: '次に読み込むデータが存在するか', type: Boolean })
  hasNextPage: boolean;

  @ApiProperty({
    description: '次のリクエストで使用するカーソル (記事ID、文字列型)',
    required: false,
    type: String,
    example: '100', 
  })
  nextCursor?: string;
}
```
