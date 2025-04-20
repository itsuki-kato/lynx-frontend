import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";
import { useState } from "react";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/Header";
import { MobileSidebar } from "~/components/layout/MobileSidebar";
import { useTheme } from "~/hooks/use-theme";
import { cn } from "~/lib/utils";

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
  const isLoginPage = matches.some((match) => match.id === "routes/login" || match.id === "routes/landing");
  const { theme, toggleTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // モバイルサイドバーを開く関数
  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  // モバイルサイドバーを閉じる関数
  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
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
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col"
      )}>
        {/* ヘッダー */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={handleOpenMobileSidebar}
        />

        {/* pt-16はヘッダーの高さ分 */}
        <div className="flex flex-grow pt-16 justify-center">
          {/* モバイル用サイドバー (ログインページ以外で表示) */}
          {!isLoginPage && (
            <MobileSidebar
              isOpen={isMobileSidebarOpen}
              onClose={handleCloseMobileSidebar}
            />
          )}

          {/* Main Content - flex flex-col justify-center を追加 */}
          <main className={cn(
            "flex flex-col justify-center flex-grow p-6 text-muted-foreground max-w-screen-2xl w-full mx-auto overflow-auto"
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
