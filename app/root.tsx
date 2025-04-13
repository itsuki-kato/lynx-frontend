import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";
import { useState } from "react"; // useEffectはuseThemeフック内で使うので削除
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/Header"; // Headerをインポート
import { Sidebar } from "~/components/layout/Sidebar"; // Sidebarをインポート
import { MobileSidebar } from "~/components/layout/MobileSidebar"; // MobileSidebarをインポート
import { useTheme } from "~/hooks/use-theme"; // useThemeフックをインポート
import { cn } from "~/lib/utils"; // cnユーティリティをインポート
// import { Provider } from "jotai"; // JotaiのProviderインポートを削除

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const isLoginPage = matches.some((match) => match.id === "routes/login");
  const { theme, toggleTheme } = useTheme(); // useThemeフックを使用
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // モバイルサイドバーの開閉状態

  // モバイルサイドバーを開く関数
  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  // モバイルサイドバーを閉じる関数
  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    // html要素のクラスはuseThemeフック内で管理される
    <html lang="ja" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      {/* bodyのクラスを調整 */}
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col",
        // theme // themeクラスはhtml要素に適用されるため不要
      )}>
        {/* Headerコンポーネントを使用 */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={handleOpenMobileSidebar}
        />

        {/* pt-16はヘッダーの高さ分 */}
        <div className="flex flex-grow pt-16">
          {/* デスクトップ用サイドバー (ログインページ以外で表示) */}
          {!isLoginPage && <Sidebar />}

          {/* モバイル用サイドバー (ログインページ以外で表示) */}
          {!isLoginPage && (
            <MobileSidebar
              isOpen={isMobileSidebarOpen}
              onClose={handleCloseMobileSidebar}
            />
          )}

          {/* Main Content */}
          {/* サイドバーの有無に応じてマージンを調整 (md以上でサイドバー表示時) */}
          {/* 最大幅(1536px)を設定し、中央揃えにする */}
          <main className={cn(
            "flex-grow p-6 text-muted-foreground max-w-screen-2xl mx-auto w-full", // max-w-screen-2xl, mx-auto, w-full を追加
            !isLoginPage && "md:ml-64" // デスクトップサイドバーの幅(w-64)分マージンを追加
          )}>
            {children}
          </main>
        </div>

        <ScrollRestoration />
        <Scripts />

        {/* Toasterコンポーネントを追加 */}
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  // Outletを直接返すように戻す
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
