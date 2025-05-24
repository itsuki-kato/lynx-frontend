# API仕様書 - Keywords

## 認証

- `/keywords` エンドポイント群へのリクエストには、AuthorizationヘッダーにBearerトークンを含める必要があります。

---

## Keywords API (`/keywords`)

### 1. キーワード単体取得 (ID指定)

- **Method:** `GET`
- **Path:** `/keywords/:id`
- **概要:** 指定されたIDのキーワード情報を1件取得します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `id` (number, **required**): 取得対象のキーワードID
- **レスポンス:**
    - **200 OK:** キーワード取得成功
        - Content-Type: `application/json`
        - Schema: `KeywordResponseDto`
          ```json
          {
            "id": 1,
            "projectId": 1,
            "keywordName": "キーワード1",
            "parentId": null,
            "level": 1,
            "searchVolume": 100,
            "difficulty": "低",
            "relevance": "〇",
            "searchIntent": "Informational",
            "importance": "中",
            "memo": null,
            "createdAt": "2025-04-30T08:40:00.000Z",
            "updatedAt": "2025-04-30T08:40:00.000Z",
            "parentKeyword": null,
            "childKeywords": [
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
                "memo": "子キーワード",
                "createdAt": "2025-04-30T08:41:00.000Z",
                "updatedAt": "2025-04-30T08:41:00.000Z",
                "parentKeyword": null, // 単体取得時は親が含まれる可能性もあるが、例では簡略化
                "childKeywords": []
              }
            ]
          }
          ```
    - **400 Bad Request:** `id` が不正な形式。
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定されたIDのキーワードが存在しない。

### 2. キーワード一覧取得 (プロジェクトID指定)

- **Method:** `GET`
- **Path:** `/keywords`
- **概要:** 指定されたプロジェクトIDに紐づくキーワードの一覧を**階層構造**で取得します。レスポンスには、各キーワードの**全階層の子キーワード**が含まれます。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **クエリパラメータ:**
    - `projectId` (number, **required**): キーワードを取得するプロジェクトのID
- **レスポンス:**
    - **200 OK:** キーワード一覧取得成功
        - Content-Type: `application/json`
        - Schema: `KeywordResponseDto[]` (キーワード情報の配列)
          ```json
          [
            {
              "id": 1,
              "projectId": 1,
              "keywordName": "キーワード1",
              "parentId": null,
              "level": 1,
              "searchVolume": 100,
              "difficulty": "低",
              "relevance": "〇",
              "searchIntent": "Informational",
              "importance": "中",
              "memo": null,
              "createdAt": "2025-04-30T08:40:00.000Z",
              "updatedAt": "2025-04-30T08:40:00.000Z",
              "parentKeyword": null,
              "childKeywords": [
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
                  "memo": "子キーワード",
                  "createdAt": "2025-04-30T08:41:00.000Z",
                  "updatedAt": "2025-04-30T08:41:00.000Z",
                  "parentKeyword": null,
                  "childKeywords": [
                    {
                      "id": 4,
                      "projectId": 1,
                      "keywordName": "キーワード2-1",
                      "parentId": 2,
                      "level": 3,
                      "searchVolume": 20,
                      "difficulty": null,
                      "relevance": null,
                      "searchIntent": null,
                      "importance": null,
                      "memo": null,
                      "createdAt": "2025-04-30T08:42:00.000Z",
                      "updatedAt": "2025-04-30T08:42:00.000Z",
                      "parentKeyword": null,
                      "childKeywords": []
                    }
                  ]
                }
              ]
            },
            {
              "id": 3,
              "projectId": 1,
              "keywordName": "キーワード3",
              "parentId": null,
              "level": 1,
              "searchVolume": 80,
              "difficulty": null,
              "relevance": null,
              "searchIntent": null,
              "importance": "高",
              "memo": null,
              "createdAt": "2025-04-30T09:00:00.000Z",
              "updatedAt": "2025-04-30T09:00:00.000Z",
              "parentKeyword": null,
              "childKeywords": []
            }
          ]
          ```
    - **400 Bad Request:** `projectId` が指定されていない、または不正な形式。
    - **401 Unauthorized:** 認証トークンが無効または不足。

### 3. キーワード作成

- **Method:** `POST`
- **Path:** `/keywords`
- **概要:** 新しいキーワードを登録します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `CreateKeywordDto`
      ```json
      {
        "projectId": 1,
        "keywordName": "新しいキーワード",
        "parentId": null, // or number
        "level": 1,
        "searchVolume": 100,
        "difficulty": "中", // or null
        "relevance": "〇", // or null
        "searchIntent": "Informational", // or null
        "importance": "高", // or null
        "memo": "対策メモ" // or null
      }
      ```
    - **フィールド:**
        - `projectId` (number, **required**): プロジェクトID
        - `keywordName` (string, **required**): キーワード名
        - `parentId` (number, optional): 親キーワードID
        - `level` (number, optional, default: 1): 階層レベル (1以上)
        - `searchVolume` (number, optional, default: 0): 検索ボリューム (0以上)
        - `difficulty` (string, optional): 競合性・難易度
        - `relevance` (string, optional): メディア目的適合度
        - `searchIntent` (string, optional): KWの検索意図
        - `importance` (string, optional): KWの重要度
        - `memo` (string, optional): メモ欄
- **レスポンス:**
    - **201 Created:** キーワード作成成功
        - Content-Type: `application/json`
        - Schema: `KeywordResponseDto`
          ```json
          {
            "id": 1,
            "projectId": 1,
            "keywordName": "新しいキーワード",
            "parentId": null,
            "level": 1,
            "searchVolume": 100,
            "difficulty": "中",
            "relevance": "〇",
            "searchIntent": "Informational",
            "importance": "高",
            "memo": "対策メモ",
            "createdAt": "2025-04-29T12:35:00.000Z",
            "updatedAt": "2025-04-29T12:35:00.000Z"
          }
          ```
    - **400 Bad Request:** リクエストボディのバリデーションエラー
    - **401 Unauthorized:** 認証トークンが無効または不足。
    - **404 Not Found:** 指定されたIDのキーワードが存在しない (キーワード作成APIでは通常発生しないが、念のため記載)。

### 4. キーワード更新

- **Method:** `PATCH`
- **Path:** `/keywords/:id`
- **概要:** 指定されたIDのキーワード情報を更新します。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `id` (number, **required**): 更新対象のキーワードID
- **リクエストボディ:**
    - Content-Type: `application/json`
    - Schema: `UpdateKeywordDto` ( `CreateKeywordDto` の全てのフィールドがオプショナル)
      ```json
      {
        "keywordName": "更新されたキーワード",
        "searchVolume": 150
      }
      ```
- **レスポンス:**
    - **200 OK:** キーワード更新成功
        - Content-Type: `application/json`
        - Schema: `KeywordResponseDto` (更新後のキーワード情報)
    - **400 Bad Request:** リクエストボディのバリデーションエラー
    - **401 Unauthorized:** 認証トークンが無効または不足
    - **404 Not Found:** 指定されたIDのキーワードが存在しない

### 5. キーワード削除

- **Method:** `DELETE`
- **Path:** `/keywords/:id`
- **概要:** 指定されたIDのキーワードを削除します。関連する `KeywordArticle` も削除される可能性があります（DBのカスケード設定による）。
- **認証:** 必要 (Bearer Token - `JwtAuthGuard` を使用)
- **パスパラメータ:**
    - `id` (number, **required**): 削除対象のキーワードID
- **レスポンス:**
    - **204 No Content:** キーワード削除成功 (レスポンスボディなし)
    - **401 Unauthorized:** 認証トークンが無効または不足
    - **404 Not Found:** 指定されたIDのキーワードが存在しない

---

## DTO定義

### `CreateKeywordDto`

```typescript
// src/keyword/dto/create-keyword.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateKeywordDto {
  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  @IsInt({ message: 'プロジェクトIDは数値である必要があります' })
  @IsNotEmpty({ message: 'プロジェクトIDは必須です' })
  projectId: number;

  @ApiProperty({ description: 'キーワード名', example: 'SEO対策' })
  @IsString({ message: 'キーワード名は文字列である必要があります' })
  @IsNotEmpty({ message: 'キーワード名は必須です' })
  keywordName: string;

  @ApiProperty({
    description: '親キーワードID（任意）',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '親キーワードIDは数値である必要があります' })
  parentId?: number;

  @ApiProperty({
    description: '階層レベル（任意、デフォルト1）',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: '階層レベルは数値である必要があります' })
  @Min(1, { message: '階層レベルは1以上である必要があります' })
  level?: number = 1;

  @ApiProperty({
    description: '検索ボリューム（任意、デフォルト0）',
    example: 1000,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: '検索ボリュームは数値である必要があります' })
  @Min(0, { message: '検索ボリュームは0以上である必要があります' })
  searchVolume?: number = 0;

  @ApiProperty({
    description: '競合性・難易度（任意）',
    example: '中',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '競合性・難易度は文字列である必要があります' })
  difficulty?: string;

  @ApiProperty({
    description: 'メディア目的適合度（任意）',
    example: '〇',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'メディア目的適合度は文字列である必要があります' })
  relevance?: string;

  @ApiProperty({
    description: 'KWの検索意図（任意）',
    example: 'Informational',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'KWの検索意図は文字列である必要があります' })
  searchIntent?: string;

  @ApiProperty({
    description: 'KWの重要度（任意）',
    example: '高',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'KWの重要度は文字列である必要があります' })
  importance?: string;

  @ApiProperty({
    description: 'メモ欄（任意）',
    example: 'この記事で対策する',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'メモ欄は文字列である必要があります' })
  memo?: string;
}
```

### `UpdateKeywordDto`

```typescript
// src/keyword/dto/update-keyword.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateKeywordDto } from './create-keyword.dto';

// CreateKeywordDto の全てのフィールドがオプショナルになります
export class UpdateKeywordDto extends PartialType(CreateKeywordDto) {}
```

### `KeywordResponseDto`

```typescript
// src/keyword/dto/keyword-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from '@prisma/client';

/**
 * キーワード情報のレスポンス DTO
 */
export class KeywordResponseDto
  implements
    Omit<Keyword, 'parentKeyword' | 'childKeywords'> /* Prismaの型と一部異なるためOmit */
{
  @ApiProperty({ description: 'キーワードID', example: 1 })
  id: number;

  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  projectId: number;

  @ApiProperty({ description: 'キーワード名', example: 'SEO' })
  keywordName: string;

  @ApiProperty({ description: '親キーワードID', example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ description: '階層レベル', example: 1 })
  level: number;

  @ApiProperty({ description: '検索ボリューム', example: 1000 })
  searchVolume: number;

  @ApiProperty({
    description: '競合性・難易度',
    example: '中',
    nullable: true,
  })
  difficulty: string | null;

  @ApiProperty({
    description: 'メディア目的適合度',
    example: '〇',
    nullable: true,
  })
  relevance: string | null;

  @ApiProperty({
    description: 'KWの検索意図',
    example: 'Informational',
    nullable: true,
  })
  searchIntent: string | null;

  @ApiProperty({ description: 'KWの重要度', example: '高', nullable: true })
  importance: string | null;

  @ApiProperty({
    description: 'メモ欄',
    example: 'この記事で対策する',
    nullable: true,
  })
  memo: string | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;

  // --- 変更 ---
  @ApiProperty({
    description: '親キーワード情報 (KeywordResponseDto型)。リスト取得APIでは循環参照を避けるためnullになります。単体取得APIでは含まれる可能性があります。',
    type: () => KeywordResponseDto, // 自己参照のため関数形式で指定
    nullable: true,
  })
  parentKeyword: KeywordResponseDto | null;

  @ApiProperty({
    description: '子キーワード情報（**全階層**の子が再帰的に含まれるKeywordResponseDto型の配列）',
    type: [KeywordResponseDto], // 配列形式で指定
  })
  childKeywords: KeywordResponseDto[];
  // --- ここまで ---
}
