import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ダッシュボード - Lynx" },
    { name: "description", content: "サイト内のコンテンツの状態を確認できます" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scraping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return { data, user, error: null };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return {
      data: [],
      user,
      error: error instanceof Error ? error.message : "データの取得に失敗しました"
    };
  }
};

export default function Home() {
  const { data, user, error } = useLoaderData<typeof loader>();
  return null;
}
