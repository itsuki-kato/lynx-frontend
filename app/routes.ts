import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"), // LPページ
  route("login", "routes/login.tsx"), // ログインページ
  route("logout", "routes/logout.tsx"), // ログアウトページ
  route("auth/success", "routes/auth/success.tsx"), // 認証成功ページ
  route("projects/new", "routes/projects/new.tsx"), // プロジェクト新規作成ページ
  route("scraping", "routes/scrapying.tsx"), // スクレイピングページ
  route("scraping/result", "routes/scraping-results.tsx"), // スクレイピング結果ページ
  route("content", "routes/content.tsx"), // コンテンツページ
  route("internal-link-matrix", "routes/internal-link-matrix.tsx"), // 内部リンクマトリックスページ
  route("keywords", "routes/keywords.tsx"), // キーワードページ
  route("keyword-article-mapping", "routes/keyword-article-mapping.tsx"), // キーワードと記事のマッピングページ
  route("analyze-overall.api", "routes/analyze-overall.api.ts"), // 記事分析API
] satisfies RouteConfig;
