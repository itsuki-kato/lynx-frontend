import type { Route } from "./+types/home";
import { useLoaderData, useMatches } from "react-router"; // useMatches をインポート
import { getSession, getSelectedProjectId } from "~/utils/session.server"; // getSelectedProjectId をインポート
// import { requireAuth } from "~/utils/auth.server"; // requireAuth は削除
import type { UserProfile } from "~/types/user"; // UserProfile をインポート
import { redirect } from "react-router"; // redirect をインポート

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ダッシュボード - Lynx" },
    { name: "description", content: "サイト内のコンテンツの状態を確認できます" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェックは root loader で行われるため削除
  // await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const selectedProjectIdString = await getSelectedProjectId(request);

  if (!token) {
    console.error("No token found in home loader, should have been redirected by root.");
    return redirect("/login");
  }

  if (!selectedProjectIdString) {
    console.error("No project selected in home loader.");
    // プロジェクトが選択されていない場合、プロジェクト作成ページへリダイレクト
    return redirect("/projects/new");
  }
  const projectId = parseInt(selectedProjectIdString, 10);
  if (isNaN(projectId)) {
    console.error("Invalid projectId in session for home loader.");
    return redirect("/projects/new");
  }

  try {
    // API仕様に基づき、選択されたプロジェクトIDを使用してスクレイピング結果を取得
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scraping/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return { data, projectId, error: null }; // projectId も返す
  } catch (error) {
    console.error("Failed to fetch data for dashboard:", error);
    return {
      data: [],
      projectId, // エラー時も projectId を返す
      error: error instanceof Error ? error.message : "ダッシュボードデータの取得に失敗しました"
    };
  }
};

export default function Home() {
  const { data, projectId, error } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const rootData = matches.find(match => match.id === 'root')?.data as { userProfile?: UserProfile } | undefined;
  const userProfile = rootData?.userProfile; // 必要であれば利用

  // TODO: 実際のダッシュボードコンポーネントをここに実装する
  if (error) {
    return <p>エラー: {typeof error === 'string' ? error : 'データの読み込みに失敗しました。'}</p>;
  }
  if (!data) {
    return <p>データを読み込み中...</p>;
  }
  // console.log(userProfile); // userProfile をコンソールに出力して確認
  // console.log(data); // data をコンソールに出力して確認
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      <p>ようこそ、{userProfile?.name || 'ユーザー'}さん</p>
      {/* ここにダッシュボードのコンテンツを表示 */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
