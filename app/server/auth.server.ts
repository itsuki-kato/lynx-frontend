import { redirect, type Session } from "react-router";
import { commitSession } from "./session.server";
import type { UserProfile } from "~/types/user";

/**
 * 認証関連の結果を表す型
 */
export type AuthResult = {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  session: Session;
  redirectTo: string | null;
};

/**
 * アクセストークンをリフレッシュする
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.status}`);
  }

  return res.json();
}

/**
 * ユーザープロファイルを取得する
 */
async function fetchUserProfile(token: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/user/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * 認証状態を確認し、必要に応じてトークンをリフレッシュする
 */
export async function authenticate(
  request: Request,
  session: Session
): Promise<AuthResult> {
  // 公開パスのチェック
  const url = new URL(request.url);
  const publicPaths = ['/', '/login', '/landing', '/auth/success', '/logout'];
  const isPublicPath = publicPaths.includes(url.pathname);

  // セッションからトークンを取得
  let token = session.get("token") as string | null;
  const refreshToken = session.get("refreshToken") as string | null;

  // 公開パスの場合は簡易チェックのみ
  if (isPublicPath) {
    return {
      isAuthenticated: !!token,
      userProfile: null,
      session,
      redirectTo: null
    };
  }

  // トークンがない場合
  if (!token) {
    // リフレッシュトークンがある場合はリフレッシュを試みる
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set("token", newTokens.accessToken);
        session.set("refreshToken", newTokens.refreshToken);
        
        // 現在のURLに再リダイレクト（新しいトークンで再試行）
        return {
          isAuthenticated: true,
          userProfile: null,
          session,
          redirectTo: request.url
        };
      } catch (error) {
        // リフレッシュ失敗時はログインへ
        session.unset("token");
        session.unset("refreshToken");
        session.flash("toastMessage", JSON.stringify({ 
          type: "error", 
          message: "セッションが切れました。再度ログインしてください。" 
        }));
        
        return {
          isAuthenticated: false,
          userProfile: null,
          session,
          redirectTo: "/login"
        };
      }
    } else {
      // リフレッシュトークンもない場合はログインへ
      session.flash("toastMessage", JSON.stringify({ 
        type: "error", 
        message: "ログインが必要です。" 
      }));
      
      return {
        isAuthenticated: false,
        userProfile: null,
        session,
        redirectTo: "/login"
      };
    }
  }

  // ユーザープロファイルを取得
  const userProfile = await fetchUserProfile(token);
  
  // プロファイル取得に失敗した場合
  if (!userProfile) {
    // 401エラーの可能性があるのでリフレッシュを試みる
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set("token", newTokens.accessToken);
        session.set("refreshToken", newTokens.refreshToken);
        
        // 現在のURLに再リダイレクト（新しいトークンで再試行）
        return {
          isAuthenticated: true,
          userProfile: null,
          session,
          redirectTo: request.url
        };
      } catch (error) {
        // リフレッシュ失敗時はログインへ
        session.unset("token");
        session.unset("refreshToken");
        session.flash("toastMessage", JSON.stringify({ 
          type: "error", 
          message: "認証に失敗しました。再度ログインしてください。" 
        }));
        
        return {
          isAuthenticated: false,
          userProfile: null,
          session,
          redirectTo: "/login"
        };
      }
    } else {
      // リフレッシュトークンがない場合はログインへ
      session.unset("token");
      session.flash("toastMessage", JSON.stringify({ 
        type: "error", 
        message: "認証に失敗しました。再度ログインしてください。" 
      }));
      
      return {
        isAuthenticated: false,
        userProfile: null,
        session,
        redirectTo: "/login"
      };
    }
  }

  // 認証成功
  return {
    isAuthenticated: true,
    userProfile,
    session,
    redirectTo: null
  };
}

/**
 * 認証結果からリダイレクトレスポンスを生成する（必要な場合）
 */
export async function createRedirectResponse(
  authResult: AuthResult
): Promise<Response | null> {
  if (authResult.redirectTo) {
    return redirect(authResult.redirectTo, {
      headers: { "Set-Cookie": await commitSession(authResult.session) }
    });
  }
  return null;
}
