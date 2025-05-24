# API仕様書 - Scraping

## 認証

- `/scraping` エンドポイント群へのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Scraping API (`/scraping`)

### 1. スクレイピング結果一括保存

- **Method:** `POST`
- **Path:** `/scraping`
- **概要:** スクレイピングによって収集された記事情報（複数可）を一括でデータベースに保存（または更新）します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `CreateScrapingResultDto`
      ```json
      {
        "projectId": 1,
        "articles": [
          {
            "articleUrl": "https://example.com/article1",
            "metaTitle": "記事タイトル1",
            "metaDescription": "記事の説明1",
            "isIndexable": true,
            "headings": { "h1": ["見出し1"], "h2": ["小見出し1"] },
            "jsonLd": { "@context": "https://schema.org", "@type": "Article" }
          },
          {
            "articleUrl": "https://example.com/article2",
            "metaTitle": "記事タイトル2",
            // ... 他のフィールド
          }
        ]
      }
      ```
    - **フィールド:**
        - `projectId` (number, **required**): スクレイピング対象のプロジェクトID
        - `articles` (Array of `ArticleData`, **required**): スクレイピングされた記事データの配列
            - `articleUrl` (string, **required**): 記事のURL
            - `metaTitle` (string, optional): メタタイトル
            - `metaDescription` (string, optional): メタディスクリプション
            - `isIndexable` (boolean, optional, default: `true`): インデックス可能か
            - `headings` (JSON, optional): 見出し構造 (例: `{ "h1": ["見出し"], "h2": ["小見出し"] }`)
            - `jsonLd` (JSON, optional): JSON-LDデータ
- **レスポンス:**
    - **201 Created:** 保存/更新処理の実行結果（具体的な件数などはUsecaseの実装による）
        - Content-Type: `application/json`
        - Schema: (Usecaseの戻り値に依存。例: `{ "createdCount": 1, "updatedCount": 1 }`)
          ```json
          // 例: Usecaseが以下のようなオブジェクトを返す場合
          {
            "message": "Bulk create/update successful.",
            "createdCount": 1, // 新規作成された記事数
            "updatedCount": 1  // 更新された記事数
          }
          ```
    - **400 Bad Request:** リクエストボディのバリデーションエラー。
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された `projectId` のプロジェクトが存在しない場合。

### 2. プロジェクトIDに紐づくスクレイピング結果（記事）一覧取得

- **Method:** `GET`
- **Path:** `/scraping/project/:projectId`
- **概要:** 指定されたプロジェクトIDに紐づく、スクレイピングによって保存された記事の一覧を取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `projectId` (number, **required**): 記事一覧を取得するプロジェクトのID
- **レスポンス:**
    - **200 OK:** 記事一覧取得成功
        - Content-Type: `application/json`
        - Schema: `ArticleResponseDto[]` (詳細は `article.md` または `keyword-article.md` の `ArticleResponseDto` を参照)
          ```json
          [
            {
              "id": 101,
              "projectId": 1,
              "articleUrl": "https://example.com/article1",
              "metaTitle": "記事タイトル1",
              "metaDescription": "記事の説明1",
              "isIndexable": true,
              "headings": { "h1": ["見出し1"] },
              "jsonLd": { "@type": "Article" },
              "createdAt": "2025-05-24T12:00:00.000Z",
              "updatedAt": "2025-05-24T12:00:00.000Z"
            }
            // ... 他の記事データ
          ]
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された `projectId` のプロジェクトが存在しない、または該当する記事が存在しない場合。

### 3. 記事IDに紐づくスクレイピング結果（記事）取得

- **Method:** `GET`
- **Path:** `/scraping/:id`
- **概要:** 指定された記事IDに紐づく、スクレイピングによって保存された単一の記事情報を取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `id` (number, **required**): 取得対象の記事ID
- **レスポンス:**
    - **200 OK:** 記事取得成功
        - Content-Type: `application/json`
        - Schema: `ArticleResponseDto` (詳細は `article.md` または `keyword-article.md` の `ArticleResponseDto` を参照)
          ```json
          {
            "id": 101,
            "projectId": 1,
            "articleUrl": "https://example.com/article1",
            "metaTitle": "記事タイトル1",
            // ... 他のフィールド
            "createdAt": "2025-05-24T12:00:00.000Z",
            "updatedAt": "2025-05-24T12:00:00.000Z"
          }
          ```
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定された `id` の記事が存在しない場合。

---

## DTO定義

### `CreateScrapingResultDto`

```typescript
// src/scraping/dto/create-scraping-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class ArticleData {
  @ApiProperty({
    description: '記事URL',
    example: 'https://example.com/article1',
  })
  @IsUrl({}, { message: '有効なURL形式である必要があります。' })
  @IsNotEmpty({ message: '記事URLは必須です。' })
  articleUrl: string;

  @ApiProperty({
    description: 'メタタイトル',
    example: '記事のタイトル',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    description: 'メタディスクリプション',
    example: '記事の簡単な説明',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    description: 'インデックス可能か (デフォルト: true)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isIndexable?: boolean = true;

  @ApiProperty({
    description: '見出し情報 (JSON形式)',
    example: { h1: ['メインタイトル'], h2: ['サブタイトル'] },
    required: false,
    type: 'object',
  })
  @IsOptional()
  @IsJSON({ message: '見出し情報は有効なJSON形式である必要があります。' })
  headings?: string; // Prisma.JsonValue は string | number | boolean | object | array | null なので、バリデーションは IsJSON で行う

  @ApiProperty({
    description: 'JSON-LD情報 (JSON形式)',
    example: { '@context': 'https://schema.org', '@type': 'Article' },
    required: false,
    type: 'object',
  })
  @IsOptional()
  @IsJSON({ message: 'JSON-LD情報は有効なJSON形式である必要があります。' })
  jsonLd?: string; // Prisma.JsonValue
}

export class CreateScrapingResultDto {
  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  @IsInt({ message: 'プロジェクトIDは数値である必要があります。' })
  @IsNotEmpty({ message: 'プロジェクトIDは必須です。' })
  projectId: number;

  @ApiProperty({ type: [ArticleData], description: 'スクレイピング結果の配列' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleData)
  articles: ArticleData[];
}
```

**注意:** `ArticleResponseDto` は `article.md` または `keyword-article.md` に定義されているものを参照してください。
