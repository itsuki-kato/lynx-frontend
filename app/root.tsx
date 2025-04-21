import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  type LoaderFunctionArgs,
} from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { Toaster } from '~/components/ui/toaster';
import { Header } from '~/components/layout/Header';
import { MobileSidebar } from '~/components/layout/MobileSidebar';
import { useTheme } from '~/hooks/use-theme';
import { cn } from '~/lib/utils';
import { getSession } from '~/utils/session.server';

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
  { rel: 'stylesheet', href: stylesheet }
];

// loader関数を追加してセッションからログイン状態を取得
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const isAuthenticated = !!session.get('userId'); // userId があればログイン状態とみなす
  return { isAuthenticated };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useLoaderData<typeof loader>(); // loaderからデータを取得
  const matches = useMatches();

  const isLoginPage = matches.some((match) => match.id === 'routes/login');
  const isLandingPage = matches.some((match) => match.id === 'routes/landing');
  const isSimpleLayoutPage = isLoginPage || (isLandingPage && !isAuthenticated);

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
        {/* ヘッダーに isSimpleLayoutPage の値を isLoginPage プロパティとして渡す */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={handleOpenMobileSidebar}
          isLoginPage={isSimpleLayoutPage}
        />

        {/* pt-16はヘッダーの高さ分 */}
        <div className="flex flex-grow pt-16 justify-center">
          {/* モバイル用サイドバー (シンプルレイアウトページ以外で表示) */}
          {!isSimpleLayoutPage && (
            <MobileSidebar
              isOpen={isMobileSidebarOpen}
              onClose={handleCloseMobileSidebar}
            />
          )}

          {/* Main Content - シンプルレイアウトページでは max-w-screen-2xl を削除 */}
          <main className={cn(
            "flex flex-col justify-center flex-grow text-muted-foreground w-full mx-auto overflow-auto",
            !isSimpleLayoutPage && "max-w-screen-2xl" // シンプルレイアウトページ以外では幅制限を適用
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
