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
  redirect,
} from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/root';
import type { UserProfile } from '~/types/user';
import stylesheet from './app.css?url';
import { Toaster } from '~/components/ui/toaster';
import { Header } from '~/components/layout/Header';
import { MobileSidebar } from '~/components/layout/MobileSidebar';
import { useTheme } from '~/hooks/use-theme';
import { cn } from '~/lib/utils';
import {
  getSession,
  commitSession,
  getSelectedProjectId,
  setSelectedProjectIdInSession
} from '~/server/session.server';
import { authenticateAndLoadUserProfile } from '~/server/auth.server';
import { handleProjectSelectionLogic } from '~/server/project.server';
import type { ActionFunctionArgs as RootActionFunctionArgs } from 'react-router';

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
export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get('Cookie'));
  let selectedProjectId: string | null = null;
  let userProfile: UserProfile | null = null;
  let isAuthenticated = false; // 初期値

  const url = new URL(request.url);
  const publicPaths = ['/login', '/landing', '/auth/success', '/logout'];

  if (publicPaths.includes(url.pathname)) {
    // 公開パスの場合、認証状態はセッションから取得し、ユーザープロファイルはnullのまま
    const tokenFromSession = session.get('token');
    isAuthenticated = !!tokenFromSession; // トークンがあれば認証済みとみなす
    selectedProjectId = await getSelectedProjectId(request); // 選択中のプロジェクトIDは取得しておく
    return { isAuthenticated, userProfile, selectedProjectId };
  }

  // 認証処理とユーザープロファイル取得
  const authResult = await authenticateAndLoadUserProfile(request, session);
  isAuthenticated = authResult.isAuthenticated;
  userProfile = authResult.userProfile;
  session = authResult.session; // 更新されたセッションを受け取る

  if (authResult.redirectResponse) {
    return authResult.redirectResponse;
  }

  // 認証済みの場合、プロジェクト選択ロジックを実行
  if (isAuthenticated && userProfile) {
    const projectSelectionResult = await handleProjectSelectionLogic(request, session, userProfile);
    selectedProjectId = projectSelectionResult.selectedProjectId;
    session = projectSelectionResult.session; // 更新されたセッションを受け取る

    if (projectSelectionResult.redirectResponse) {
      return projectSelectionResult.redirectResponse;
    }
  } else if (isAuthenticated && !userProfile) {
    // 認証はされているが、何らかの理由でユーザープロファイルが取得できなかった場合
    // (authenticateAndLoadUserProfile でリダイレクトされなかったケース)
    // ここで再度ログインページにリダイレクトするか、エラー処理を行う
    console.error("User is authenticated but profile is null, redirecting to login.");
    // セッションを破棄してログインへ
    session.unset('token');
    session.unset('refreshToken');
    return redirect('/login', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }


  return { isAuthenticated, userProfile, selectedProjectId };
}

// プロジェクト選択を処理するaction関数
export async function action({ request }: RootActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const newSelectedProjectId = formData.get("selectedProjectId");

  if (typeof newSelectedProjectId === 'string') {
    setSelectedProjectIdInSession(session, newSelectedProjectId);

    // 選択されたプロジェクトIDをセッションに保存
    const referer = request.headers.get('Referer') || '/';
    return redirect(referer, {
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
  const isProjectNewPage = matches.some((match) => match.pathname === '/projects/new');
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
