import type { Route } from "./+types/success";
import { redirect } from "react-router";
import { getSession, commitSession } from "../../utils/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    // URLパラメータからトークンを取得
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const refreshToken = url.searchParams.get("refreshToken");

    if (!token || !refreshToken) {
      throw new Error('Tokens not found in URL parameters');
    }

    // アクセストークンを使ってユーザー情報を取得
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ユーザー情報の取得に失敗した場合はログイン画面にリダイレクト
    if (!res.ok) {
      throw new Error(`Failed to fetch User Data: ${res.status} - ${res.statusText}`);
    }

    const session = await getSession(request.headers.get("Cookie"));
    const user = await res.json();
    
    // セッションにトークン、リフレッシュトークン、ユーザー情報を保存
    session.set("token", token);
    session.set("refreshToken", refreshToken);
    session.set("user", user);

    // ユーザー情報を取得できた場合はホーム画面にリダイレクト
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return redirect("/login");
  }
};
