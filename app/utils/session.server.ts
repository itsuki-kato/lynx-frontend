import { createCookieSessionStorage } from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const getSession = sessionStorage.getSession;
export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;

/**
 * リクエストから選択されているプロジェクトIDを取得します。
 * @param request RemixのRequestオブジェクト
 * @returns 選択されているプロジェクトID (文字列)、または存在しない場合はnull
 */
export async function getSelectedProjectId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("selectedProjectId") || null;
}

/**
 * セッションに選択されたプロジェクトIDを設定します。
 * 注意: この関数はセッションをコミットしません。別途 commitSession を呼び出す必要があります。
 * @param session RemixのSessionオブジェクト
 * @param projectId 設定するプロジェクトID (文字列)
 */
export function setSelectedProjectIdInSession(session: any, projectId: string): void {
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
