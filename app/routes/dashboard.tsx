import type { Route } from './+types/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { authenticate } from '~/server/auth.server';
import { getSession, getSelectedProjectIdFromSession } from '~/server/session.server';
import type { UserProfile, Project } from '~/types/user';
import type { ArticleItem } from '~/types/article';
import type { Keyword } from '~/types/keyword';
import RewriteArticleSearch from '~/components/dashboard/RewriteArticleSearch';
import RecentArticles from '~/components/dashboard/RecentArticles';
import KeyKeywords from '~/components/dashboard/KeyKeywords';

// Loaderで取得するデータの型定義
export interface DashboardLoaderData {
  user: UserProfile | null; // userがnullの場合も考慮
  projects: Project[];
  selectedProjectSummary: {
    projectId: number;
    projectName: string;
    siteUrl: string;
    totalArticles: number;
    totalKeywords: number;
    lastAcquisitionDate: string | null; // Date型を文字列として扱うか、Date型のままにするか検討。loaderで文字列化が安全。
  } | null;
  detailedArticles: ArticleItem[];
  keywords: Keyword[];
  error?: string;
}

export async function loader({ request }: Route.LoaderArgs): Promise<DashboardLoaderData> {
  const session = await getSession(request.headers.get("Cookie"));
  const authResult = await authenticate(request, session);

  const user = authResult.userProfile; // userProfile は UserProfile | null 型の可能性がある
  const token = session.get("token") as string | null;

  try {
    // userがnullの場合はプロジェクトも空配列とする
    const projects = user?.projects || [];

    let currentProjectId: number | null = null;
    const selectedProjectIdFromSession = getSelectedProjectIdFromSession(session);
    if (selectedProjectIdFromSession) {
      currentProjectId = parseInt(selectedProjectIdFromSession, 10);
      if (isNaN(currentProjectId)) currentProjectId = null;
    }

    if (currentProjectId === null && projects.length > 0) {
      currentProjectId = projects[0].id;
    }

    let selectedProjectSummary: DashboardLoaderData['selectedProjectSummary'] = null;
    let detailedArticles: ArticleItem[] = []; // 詳細記事リストの初期化
    let keywords: Keyword[] = []; // keywords をここで初期化

    if (currentProjectId) {
      const projectDetails = projects.find(p => p.id === currentProjectId);

      if (projectDetails) {
        try {
          // 詳細記事情報を取得するように変更
          const articlesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/articles/project/${currentProjectId}/detailed`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (articlesRes.ok) {
            detailedArticles = await articlesRes.json(); // detailedArticles に格納
          } else {
            console.error(`Failed to fetch detailed articles: ${articlesRes.status}`);
          }
        } catch (e) { console.error("Error fetching detailed articles:", e); }

        try {
          const keywordsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords/project/${currentProjectId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (keywordsRes.ok) {
            keywords = await keywordsRes.json();
          } else {
            console.error(`Failed to fetch keywords: ${keywordsRes.status}`);
          }
        } catch (e) { console.error("Error fetching keywords:", e); }

        selectedProjectSummary = {
          projectId: projectDetails.id,
          projectName: projectDetails.projectName,
          siteUrl: projectDetails.projectUrl,
          totalArticles: detailedArticles.length, // detailedArticles の長さを使用
          totalKeywords: Array.isArray(keywords) ? keywords.length : 0, // keywordsが配列であることを確認
          lastAcquisitionDate: projectDetails.lastAcquisitionDate ? new Date(projectDetails.lastAcquisitionDate).toLocaleDateString('ja-JP') : null,
        };
      }
    }

    return { user, projects, selectedProjectSummary, detailedArticles, keywords };

  } catch (error) {
    console.error("Dashboard loader error:", error);
    const errorMessage = error instanceof Error ? error.message : "データの読み込み中にエラーが発生しました。";

    return { // Pickを除き、detailedArticlesも追加
      user,
      projects: user?.projects || [], // userがnullの場合を考慮
      selectedProjectSummary: null,
      detailedArticles: [], // エラー時は空配列
      keywords: [], // エラー時は空配列
      error: errorMessage
    };
  }
}


export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { user, projects, selectedProjectSummary, detailedArticles, keywords, error } = loaderData;

  if (error) {
    return (
      <div className="container mx-auto py-8 text-destructive">
        <h1 className="mb-4 text-2xl font-bold">エラー</h1>
        <p>{error}</p>
        <p className="mt-4">問題が解決しない場合は、管理者にお問い合わせください。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">ダッシュボード</h1>
      <p className="mb-8 text-muted-foreground">
        ようこそ、{user?.name || 'ユーザー'}さん。プロジェクトの全体像を把握し、サイト管理を効率化しましょう。
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>プロジェクトサマリー</CardTitle>
          <CardDescription>
            {selectedProjectSummary ? `${selectedProjectSummary.projectName} (${selectedProjectSummary.siteUrl})` : 'プロジェクトが選択されていません'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProjectSummary ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">総記事数</p>
                <p className="text-2xl font-bold">{selectedProjectSummary.totalArticles}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">総キーワード数</p>
                <p className="text-2xl font-bold">{selectedProjectSummary.totalKeywords}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">最終スクレイピング</p>
                <p className="text-2xl font-bold">{selectedProjectSummary.lastAcquisitionDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">インデックス率</p>
                <p className="text-2xl font-bold">N/A</p>
              </div>
            </div>
          ) : (
            <p>プロジェクトを選択するか、新しいプロジェクトを作成してください。</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>リライト対象記事の検索</CardTitle>
          <CardDescription>最終更新日から指定した日数以上経過した記事を検索します。</CardDescription>
        </CardHeader>
        <CardContent>
          <RewriteArticleSearch />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>最近追加/更新された記事</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentArticles />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>主要キーワード</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyKeywords />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>サイトSEO健全性</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ここにサイトの健全性指標が表示されます。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
