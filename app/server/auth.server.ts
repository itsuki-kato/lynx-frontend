import { redirect, type Session } from "react-router";
import { commitSession } from "./session.server";
import type { UserProfile } from "~/types/user";

/**
 * アクセストークンをリフレッシュする
 * @param {string} refreshToken リフレッシュトークン
 * @returns { accessToken: string; refreshToken: string }
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
    const errorBody = await res.text();
    console.error(
      "Failed to refresh token, status:",
      res.status,
      "body:",
      errorBody
    );
    throw new Error(`Failed to refresh token: ${res.status} ${errorBody}`);
  }

  return res.json();
}

/**
 * ログインページへリダイレクトするレスポンスを生成
 * @param {Session} session セッションオブジェクト
 * @param {boolean} commitTheSession セッションをコミットするかどうか (デフォルトはtrue)
 * @return {Promise<{ isAuthenticated: boolean; userProfile: UserProfile | null; token: string | null; redirectResponse: Response; session: Session }>}
 */
export async function createLoginRedirectResponse(
  session: Session,
  commitTheSession: boolean = true // デフォルトでセッションをコミットする
): Promise<{
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  token: string | null;
  redirectResponse: Response;
  session: Session;
}> {
  console.log(
    "Redirecting to login, clearing tokens from session if specified."
  );
  if (commitTheSession) {
    session.unset("token");
    session.unset("refreshToken");
    // フラッシュメッセージをセッションに保存
    session.flash(
      "toastMessage",
      JSON.stringify({ type: "error", message: "ログインが必要です。" })
    );
  }
  const headers: HeadersInit = {};
  if (commitTheSession) {
    headers["Set-Cookie"] = await commitSession(session);
  }
  return {
    isAuthenticated: false,
    userProfile: null,
    token: null,
    redirectResponse: redirect("/login", { headers }),
    session,
  };
}

/**
 * リダイレクトレスポンスを生成し、現在のURLにリロードして新しいトークンで再試行する
 * @param {Request} request リクエストオブジェクト
 * @param {Session} session セッションオブジェクト
 * @param {string} newToken 新しいアクセストークン
 * @return {Promise<{ isAuthenticated: boolean; userProfile: UserProfile | null; token: string | null; redirectResponse: Response; session: Session }>}
 */
async function createReloadRedirectResponse(
  request: Request,
  session: Session,
  newToken: string
): Promise<{
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  token: string | null;
  redirectResponse: Response;
  session: Session;
}> {
  console.log("Redirecting to current URL to retry with new token.");
  // セッションには新しいトークンがセットされている前提
  return {
    isAuthenticated: true, // トークンは取得/更新された
    userProfile: null, // プロファイルは次のリクエストで取得
    token: newToken,
    redirectResponse: redirect(request.url, {
      headers: { "Set-Cookie": await commitSession(session) },
    }),
    session,
  };
}

/**
 * 認証とユーザープロファイルの取得を行う
 * @param {Request} request リクエストオブジェクト
 * @param {Session} session セッションオブジェクト
 * @return {Promise<{ isAuthenticated: boolean; userProfile: UserProfile | null; token: string | null; redirectResponse: Response | null; session: Session }>}
 */
export async function authenticateAndLoadUserProfile(
  request: Request,
  session: Session
): Promise<{
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  token: string | null;
  redirectResponse: Response | null;
  session: Session;
}> {
  let token = session.get("token") as string | null;
  const refreshToken = session.get("refreshToken") as string | null;

  console.log("ここまで3")

  // 1. アクセストークンがない場合
  if (!token) {
    if (refreshToken) {
      // 1a. リフレッシュトークンがある場合：トークンリフレッシュを試みる
      console.log(
        "No access token, attempting token refresh in authenticateAndLoadUserProfile..."
      );
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set("token", newTokens.accessToken);
        session.set("refreshToken", newTokens.refreshToken);
        token = newTokens.accessToken; // 後続処理のために更新
        return await createReloadRedirectResponse(
          request,
          session,
          newTokens.accessToken
        );
      } catch (error) {
        console.error(
          "Initial token refresh failed, redirecting to login:",
          error
        );
        // リフレッシュ失敗時はセッションからトークンを削除してログインへ
        return await createLoginRedirectResponse(session, true);
      }
    } else {
      // 1b. リフレッシュトークンもない場合：ログインページへ
      console.log(
        "No tokens found, redirecting to login from authenticateAndLoadUserProfile. Clearing session."
      );
      // 念のためセッションをクリアしてログインへリダイレクト
      return await createLoginRedirectResponse(session, true);
    }
  }

  // 2. アクセストークンがある場合：ユーザープロファイルを取得
  try {
    console.log("Fetching user profile with access token:", token);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/user/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      const userProfile: UserProfile = await response.json();
      return {
        isAuthenticated: true,
        userProfile,
        token,
        redirectResponse: null,
        session,
      };
    }

    // プロファイル取得失敗
    if (response.status === 401 && refreshToken) {
      // 2a. 401エラーでリフレッシュトークンがある場合：再度リフレッシュを試みる
      console.log("/user/me returned 401, attempting token refresh...");
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set("token", newTokens.accessToken);
        session.set("refreshToken", newTokens.refreshToken);
        token = newTokens.accessToken; // 後続処理のために更新
        return await createReloadRedirectResponse(
          request,
          session,
          newTokens.accessToken
        );
      } catch (refreshError) {
        console.error(
          "Token refresh failed after /user/me 401, redirecting to login:",
          refreshError
        );
        return await createLoginRedirectResponse(session, true);
      }
    } else {
      // 2b. 401以外のエラー、またはリフレッシュトークンがない401
      const errorBody = await response.text();
      console.error(
        `Failed to fetch user profile (status: ${response.status}), or no refresh token for 401. Error: ${errorBody}. Redirecting to login.`
      );
      return await createLoginRedirectResponse(session, true);
    }
  } catch (error) {
    // fetch自体が失敗した場合など (ネットワークエラー等)
    console.error("Error fetching user profile (network or other):", error);
    return await createLoginRedirectResponse(session, true);
  }
}
