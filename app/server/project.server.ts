import { redirect, type Session } from "react-router";
import type { UserProfile } from "~/types/user";
import {
  getSelectedProjectIdFromSession,
  setSelectedProjectIdInSession,
  commitSession,
} from "~/server/session.server";

/**
 * プロジェクト選択の結果を表す型
 */
export type ProjectSelectionResult = {
  selectedProjectId: string | null;
  session: Session;
  redirectTo: string | null;
};

/**
 * プロジェクト選択ロジックを処理する
 */
export async function handleProjectSelection(
  request: Request,
  session: Session,
  userProfile: UserProfile | null
): Promise<ProjectSelectionResult> {
  // ユーザープロファイルがない場合
  if (!userProfile) {
    return {
      selectedProjectId: null,
      session,
      redirectTo: null
    };
  }

  const url = new URL(request.url);
  const currentPath = url.pathname;
  
  // プロジェクト作成ページへのアクセスは常に許可
  if (currentPath === "/projects/new") {
    return {
      selectedProjectId: null,
      session,
      redirectTo: null
    };
  }

  // プロジェクトが存在しない場合は新規作成ページへリダイレクト
  if (userProfile.projects.length === 0) {
    return {
      selectedProjectId: null,
      session,
      redirectTo: "/projects/new"
    };
  }

  // セッションから選択中のプロジェクトIDを取得
  let selectedProjectId = getSelectedProjectIdFromSession(session);
  const projectIds = userProfile.projects.map(p => p.id.toString());

  // 選択中のプロジェクトIDが無効な場合は最初のプロジェクトを選択
  if (!selectedProjectId || !projectIds.includes(selectedProjectId)) {
    selectedProjectId = projectIds[0];
    setSelectedProjectIdInSession(session, selectedProjectId);
    
    // 現在のURLに再リダイレクト（新しいプロジェクトIDで再試行）
    return {
      selectedProjectId,
      session,
      redirectTo: currentPath
    };
  }

  // 有効なプロジェクトIDが選択されている場合
  return {
    selectedProjectId,
    session,
    redirectTo: null
  };
}

/**
 * プロジェクト選択結果からリダイレクトレスポンスを生成する（必要な場合）
 */
export async function createProjectRedirectResponse(
  result: ProjectSelectionResult
): Promise<Response | null> {
  if (result.redirectTo) {
    return redirect(result.redirectTo, {
      headers: { "Set-Cookie": await commitSession(result.session) }
    });
  }
  return null;
}
