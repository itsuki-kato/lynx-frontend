import { createCookieSessionStorage } from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // セッションCookieの名前
    secrets: [sessionSecret], // セッションCookieの秘密鍵
    sameSite: "lax", // CSRF対策のため、SameSite属性を設定
    path: "/", // Cookieのパスをルートに設定
    httpOnly: true, // JavaScriptからCookieにアクセスできないようにする
    secure: process.env.NODE_ENV === "production", // 本番環境ではSecure属性を有効にする
  },
});

export const getSession = sessionStorage.getSession;
export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;

/**
 * セッションから選択されているプロジェクトIDを取得します。
 * @param session RemixのSessionオブジェクト
 * @return 選択されたプロジェクトID (文字列) または null
 */
export function getSelectedProjectIdFromSession(session: any): string | null {
  return session.get("selectedProjectId") || null;
}

/**
 * セッションに選択されたプロジェクトIDを設定します。
 * 注意: この関数はセッションをコミットしません。別途 commitSession を呼び出す必要があります。
 * @param session RemixのSessionオブジェクト
 * @param projectId 設定するプロジェクトID (文字列)
 */
export function setSelectedProjectIdInSession(
  session: any,
  projectId: string
): void {
  session.set("selectedProjectId", projectId);
}

/**
 * セッションから選択されたプロジェクトIDを削除します。
 * 注意: この関数はセッションをコミットしません。別途 commitSession を呼び出す必要があります。
 * @param session RemixのSessionオブジェクト
 */
export function clearSelectedProjectIdInSession(session: any): void {
  session.unset("selectedProjectId");
}
