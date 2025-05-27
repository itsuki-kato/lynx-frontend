import { redirect, type Session } from "react-router";
import type { UserProfile } from "~/types/user";
import {
  getSelectedProjectId,
  setSelectedProjectIdInSession,
  commitSession,
} from "~/server/session.server";

/**
 * プロジェクトの選択ロジックを処理し、必要に応じてリダイレクトを行います。
 * @param request - 現在のリクエストオブジェクト
 * @param session - 現在のセッションオブジェクト
 * @param userProfile - 認証済みユーザーのプロファイル情報
 * @returns selectedProjectId と redirectResponse (リダイレクトが必要な場合) を含むオブジェクト
 */
export async function handleProjectSelectionLogic(
  request: Request,
  session: Session,
  userProfile: UserProfile | null
): Promise<{
  selectedProjectId: string | null;
  redirectResponse: Response | null;
  session: Session;
}> {
  // 選択中のプロジェクトIDを取得
  let selectedProjectId = await getSelectedProjectId(request);
  const url = new URL(request.url);

  // プロジェクト未作成時のリダイレクト処理
  if (
    userProfile &&
    userProfile.projects.length === 0 &&
    url.pathname !== "/projects/new" // プロジェクト作成ページ自体へのアクセスは許可
  ) {
    console.log(
      "No projects found for user, redirecting to /projects/new from project.server.ts"
    );
    return {
      selectedProjectId: null,
      redirectResponse: redirect("/projects/new"),
      session,
    };
  }

  // プロジェクトが存在し、選択中のプロジェクトIDが無効な場合の処理
  if (userProfile && userProfile.projects.length > 0) {
    const projectIds = userProfile.projects.map((p) => p.id.toString());
    let newSelectedProjectId = selectedProjectId;

    if (!newSelectedProjectId || !projectIds.includes(newSelectedProjectId)) {
      newSelectedProjectId = projectIds[0];
      if (newSelectedProjectId) {
        setSelectedProjectIdInSession(session, newSelectedProjectId);
        console.log(
          `Selected project ID was invalid or not set. Defaulting to ${newSelectedProjectId}. Redirecting to commit session from project.server.ts.`
        );
        return {
          selectedProjectId: newSelectedProjectId, // デフォルト設定されたIDを返す
          redirectResponse: redirect(request.url, {
            headers: { "Set-Cookie": await commitSession(session) },
          }),
          session,
        };
      }
    }
    selectedProjectId = newSelectedProjectId; // 有効なID、またはデフォルト設定されなかった場合は元のID
  }

  return { selectedProjectId, redirectResponse: null, session };
}
