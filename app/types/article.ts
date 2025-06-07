// 見出しの階層構造の型定義
export interface HeadingItem {
  id?: number;
  articleId?: number;
  tag: string;
  text: string;
  level?: number;
  parentId?: number | null;
  order?: number;
  parent?: HeadingItem;
  children: HeadingItem[];
}

// 内部リンクの型定義
export interface InternalLinkItem {
  id?: number;
  type?: string;
  criteriaArticleId?: number;
  linkedArticleId?: number;
  anchorText?: string | null;
  linkUrl: string;  
  rel?: string | null;
  isActive?: boolean;
  isFollow?: boolean; // follow/nofollow の状態
  status?: {
    code: number;
    redirectUrl: string;
  };
}

// 外部リンクの型定義
export interface OuterLinkItem {
  id?: number;
  type?: string;
  anchorText?: string | null;
  linkUrl: string;
  rel?: string | null;
  isActive?: boolean;
  isFollow?: boolean; // follow/nofollow の状態
  status?: {
    code: number;
    redirectUrl: string;
  };
}

// キーワードの型定義
export interface KeywordItem {
  id?: number;
  projectId?: number;
  keywordName: string;
  parentId?: number | null;
  level?: number;
  searchVolume?: number;
  cpc?: number | null;
  parentKeyword?: KeywordItem;
  childKeywords?: KeywordItem[];
}

// キーワードと記事の中間テーブルの型定義
export interface KeywordArticleItem {
  keywordId: number;
  articleId: number;
  keyword?: KeywordItem;
}

// 記事の型定義
export interface ArticleItem {
  id?: string | number;
  projectId?: number;
  articleUrl: string;
  metaTitle: string;
  metaDescription: string;
  isIndexable?: boolean;
  internalLinks: InternalLinkItem[];
  outerLinks: OuterLinkItem[]; // 外部リンク
  linkedFrom?: InternalLinkItem[];
  headings?: HeadingItem[];
  keywords?: KeywordArticleItem[];
  jsonLd?: any[]; // 構造化データ（JSON-LD）
}

// --- ここから新しい型定義を追加 ---

/**
 * API: /articles/project/:projectId/feed のレスポンス型
 * API仕様書: .clinerules/api/article.md の PaginatedArticlesResponseDto に対応
 * 記事の型は既存の ArticleItem を使用します。
 */
export interface PaginatedArticlesResponse {
  articles: ArticleItem[];
  hasNextPage: boolean;
  nextCursor?: string | null;
}

/**
 * content.tsx の loader が返すデータの型
 * 記事の型は既存の ArticleItem を使用します。
 */
export interface ContentLoaderData {
  articles: ArticleItem[]; // 初期表示の記事リスト
  projectId: number | null;
  initialHasNextPage: boolean;
  initialNextCursor?: string | null;
  error: string | null;
  token?: string | null; // クライアントサイドでのAPI呼び出し用にトークンを渡す
}
