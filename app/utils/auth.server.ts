import { redirect } from "react-router";
import { getSession, commitSession } from "./session.server";

export async function requireAuth(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  console.log("認証チェック")

  const accessToken = session.get("token");
  const refreshToken = session.get("refreshToken");

  if (!accessToken || !refreshToken) {
    throw redirect("/login");
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401) {
      // アクセストークンが無効な場合、リフレッシュトークンを使用
      const newTokens = await refreshAccessToken(refreshToken);
      
      // セッションを更新
      session.set("token", newTokens.accessToken);
      session.set("refreshToken", newTokens.refreshToken);
      
      // 新しいセッションをクッキーに保存
      throw redirect(request.url, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    if (!res.ok) {
      throw redirect("/login");
    }
  } catch (error) {
    console.error("Auth error:", error);
    throw redirect("/login");
  }

  return;
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  return res.json();
}
