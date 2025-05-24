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
  redirect, // redirect をインポート
} from 'react-router';
import { useState } from 'react';
import type { Route } from './+types/root';
import type { UserProfile, Project } from '~/types/user'; // UserProfile, Project をインポート
import stylesheet from './app.css?url';
import { Toaster } from '~/components/ui/toaster';
import { Header } from '~/components/layout/Header';
import { MobileSidebar } from '~/components/layout/MobileSidebar';
import { useTheme } from '~/hooks/use-theme';
import { cn } from '~/lib/utils';
import { 
  getSession, 
  commitSession, 
  destroySession,
  getSelectedProjectId, 
  setSelectedProjectIdInSession
} from '~/utils/session.server'; // getSelectedProjectId, setSelectedProjectIdInSession をインポート
import { refreshAccessToken } from '~/utils/auth.server'; // refreshAccessToken をインポート
import type { ActionFunctionArgs as RootActionFunctionArgs } from 'react-router'; // ActionFunctionArgs を RootActionFunctionArgs としてインポート

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

// loader関数を修正してユーザー情報とプロジェクト情報を取得
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  let token = session.get('token');
  const refreshToken = session.get('refreshToken');
  let isAuthenticated = !!token;
  let userProfile: UserProfile | null = null;
  let selectedProjectId: string | null = null; // 選択されたプロジェクトIDを格納する変数
  const url = new URL(request.url);

  // ログインページ、ランディングページ、認証成功ページ、ログアウトページは認証チェックをスキップ
  const publicPaths = ['/login', '/landing', '/auth/success', '/logout', '/projects/new']; // /projects/new も追加
  if (publicPaths.includes(url.pathname)) {
    // 認証状態とユーザープロファイル、選択中プロジェクトIDを返す
    selectedProjectId = await getSelectedProjectId(request);
    return { isAuthenticated, userProfile, selectedProjectId };
  }

  console.log('Root loader - isAuthenticated:', isAuthenticated, 'token:', token, 'refreshToken:', refreshToken);

  if (!isAuthenticated && refreshToken) {
    // アクセストークンがなくリフレッシュトークンがある場合、まずトークンリフレッシュを試みる
    try {
      console.log('Attempting token refresh in root loader...');
      const newTokens = await refreshAccessToken(refreshToken);
      session.set('token', newTokens.accessToken);
      session.set('refreshToken', newTokens.refreshToken);
      token = newTokens.accessToken;
      isAuthenticated = true;
      // セッションをコミットして新しいCookieをセットし、現在のページにリダイレクト
      return redirect(request.url, {
        headers: { 'Set-Cookie': await commitSession(session) },
      });
    } catch (error) {
      console.error('Token refresh failed in root loader, redirecting to login:', error);
      // リフレッシュ失敗時はログインページへ（セッションも破棄）
      return redirect('/login', {
        headers: { 'Set-Cookie': await destroySession(session) },
      });
    }
  } else if (!isAuthenticated) {
    // トークンが一切ない場合はログインページへ
    console.log('No tokens found, redirecting to login from root loader.');
    return redirect('/login');
  }

  // 認証済みの場合、ユーザープロファイルを取得
  if (isAuthenticated && token) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        userProfile = await response.json();
      } else if (response.status === 401 && refreshToken) {
        // /user/me が401でリフレッシュトークンがある場合、再度リフレッシュを試みる
        console.log('/user/me returned 401, attempting token refresh in root loader...');
        try {
          const newTokens = await refreshAccessToken(refreshToken);
          session.set('token', newTokens.accessToken);
          session.set('refreshToken', newTokens.refreshToken);
          // セッションをコミットして新しいCookieをセットし、現在のページにリダイレクトして再試行
          return redirect(request.url, {
            headers: { 'Set-Cookie': await commitSession(session) },
          });
        } catch (refreshError) {
          console.error('Token refresh failed after /user/me 401, redirecting to login:', refreshError);
          return redirect('/login', {
            headers: { 'Set-Cookie': await destroySession(session) },
          });
        }
      } else {
        // 401以外のエラー、またはリフレッシュトークンがない401
        console.error('Failed to fetch user profile, status:', response.status, await response.text());
        return redirect('/login', {
          headers: { 'Set-Cookie': await destroySession(session) },
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return redirect('/login', {
        headers: { 'Set-Cookie': await destroySession(session) },
      });
    }
  }

  // 認証済みの場合、ユーザープロファイルと選択中プロジェクトIDを取得
  selectedProjectId = await getSelectedProjectId(request);

  // プロジェクト未作成時のリダイレクト処理
  if (
    isAuthenticated &&
    userProfile &&
    (!userProfile.projects || userProfile.projects.length === 0) &&
    url.pathname !== '/projects/new' // プロジェクト作成ページ自体へのアクセスは許可
  ) {
    console.log('No projects found for user, redirecting to /projects/new');
    return redirect('/projects/new');
  }

  // プロジェクトが存在し、選択中のプロジェクトIDが無効な場合の処理
  if (userProfile && userProfile.projects && userProfile.projects.length > 0) {
    const projectIds = userProfile.projects.map(p => p.id.toString());
    let newSelectedProjectId = selectedProjectId; // 更新用の一時変数

    if (!newSelectedProjectId || !projectIds.includes(newSelectedProjectId)) {
      // 選択中のIDがない、または無効なIDの場合、最初のプロジェクトを選択状態にする
      newSelectedProjectId = projectIds[0];
      // setSelectedProjectIdInSession は string 型を期待するため、nullでないことを保証
      if (newSelectedProjectId) {
        setSelectedProjectIdInSession(session, newSelectedProjectId);
        console.log(`Selected project ID was invalid or not set. Defaulting to ${newSelectedProjectId}. Redirecting to commit session.`);
        // セッションをコミットしてリダイレクトし、選択状態を反映
        return redirect(request.url, {
          headers: { 'Set-Cookie': await commitSession(session) },
        });
      }
    }
    // selectedProjectId を更新された値で確定（リダイレクトしなかった場合）
    selectedProjectId = newSelectedProjectId;
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
    // どこから呼び出されたかによってリダイレクト先を変えることもできるが、
    // 基本的には現在のページを再読み込み（リダイレクト）してloaderを再実行させる
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
        "bg-background font-sans antialiased flex flex-col"
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
