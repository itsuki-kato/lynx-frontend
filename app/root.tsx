import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  redirect,
} from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { Toaster } from '~/components/ui/toaster';
import { Header } from '~/components/layout/Header';
import { MobileSidebar } from '~/components/layout/MobileSidebar';
import { useTheme } from '~/hooks/use-theme';
import { cn } from '~/lib/utils';
import {
  getSession,
  commitSession,
  setSelectedProjectIdInSession
} from '~/server/session.server';
import {
  authenticate,
  createRedirectResponse,
  type AuthResult
} from '~/server/auth.server';
import {
  handleProjectSelection,
  createProjectRedirectResponse,
  type ProjectSelectionResult
} from '~/server/project.server';

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

// ユーザー情報とプロジェクト情報を取得
export async function loader({ request }: Route.LoaderArgs) {
  // セッションを取得
  let session = await getSession(request.headers.get('Cookie'));

  // 認証処理を実行
  const authResult: AuthResult = await authenticate(request, session);

  // 認証結果からリダイレクトが必要な場合は実行
  const authRedirect = await createRedirectResponse(authResult);
  if (authRedirect) {
    return authRedirect;
  }

  // 認証結果を取得
  const { isAuthenticated, userProfile } = authResult;
  session = authResult.session; // 更新されたセッションを受け取る

  // 認証されていない場合は早期リターン
  if (!isAuthenticated) {
    return { isAuthenticated, userProfile, selectedProjectId: null };
  }

  // 公開パスの場合はプロジェクト選択をスキップ
  const url = new URL(request.url);
  const publicPaths = ['/', '/login', '/landing', '/auth/success', '/logout', '/projects/new'];
  if (publicPaths.includes(url.pathname)) {
    return { isAuthenticated, userProfile, selectedProjectId: null };
  }

  // プロジェクト選択ロジックを実行
  const projectResult: ProjectSelectionResult = await handleProjectSelection(
    request,
    session,
    userProfile
  );

  // プロジェクト選択結果からリダイレクトが必要な場合は実行
  const projectRedirect = await createProjectRedirectResponse(projectResult);
  if (projectRedirect) {
    return projectRedirect;
  }

  // 最終的な結果を返す
  return {
    isAuthenticated,
    userProfile,
    selectedProjectId: projectResult.selectedProjectId
  };
}

// プロジェクト選択を処理するaction関数
export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const newSelectedProjectId = formData.get("selectedProjectId");

  if (typeof newSelectedProjectId === 'string') {
    setSelectedProjectIdInSession(session, newSelectedProjectId);

    // 選択されたプロジェクトIDをセッションに保存
    const currentPath = new URL(request.url).pathname;
    return redirect(currentPath, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
  // 不正なリクエストの場合は何もしないかエラーを返す
  return new Response("Bad Request", { status: 400 });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userProfile, selectedProjectId } = useLoaderData<typeof loader>();
  const matches = useMatches();

  const isLoginPage = matches.some((match) => match.id === 'routes/login');
  const isProjectNewPage = matches.some((match) => match.id === 'routes/projects/new');
  const isLandingPage = matches.some((match) => match.id === 'routes/landing');

  // ログインページ、プロジェクト作成ページ、またはLPで認証されていない場合はシンプルレイアウト
  const isSimpleLayoutPage = isLoginPage || isProjectNewPage || (isLandingPage && !isAuthenticated);

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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body className={cn(
        "bg-background font-sans antialiased flex flex-col min-h-screen"
      )}>
        {/* ヘッダーに isSimpleLayoutPage の値を isLoginPage プロパティとして渡す */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenMobileSidebar={handleOpenMobileSidebar}
          isSimpleLayoutPage={isSimpleLayoutPage}
          userProfile={userProfile} // userProfile を渡す
          selectedProjectId={selectedProjectId} // selectedProjectId を渡す
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

          {/* Main Content */}
          <main className={cn(
            "flex flex-col justify-center flex-grow text-muted-foreground w-full mx-auto overflow-auto",
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
