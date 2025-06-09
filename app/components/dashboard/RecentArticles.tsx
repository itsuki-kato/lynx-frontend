import { useLoaderData } from 'react-router';
import { Link } from 'react-router';
import type { DashboardLoaderData } from '~/routes/dashboard';

const MAX_RECENT_ARTICLES = 5; // 表示する最大記事数

export default function RecentArticles() {
  const { detailedArticles } = useLoaderData() as DashboardLoaderData;

  // updatedAtが存在すればそれでソート、なければcreatedAtでソート
  // 両方なければリストの最後尾に来るようにする
  const sortedArticles = [...detailedArticles].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt) : (a.createdAt ? new Date(a.createdAt) : null);
    const dateB = b.updatedAt ? new Date(b.updatedAt) : (b.createdAt ? new Date(b.createdAt) : null);

    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime(); // 降順
    }
    if (dateA) return -1; // Aが前
    if (dateB) return 1;  // Bが前
    return 0; // 両方日付なし
  });

  const recentArticles = sortedArticles.slice(0, MAX_RECENT_ARTICLES);

  if (!detailedArticles || detailedArticles.length === 0) {
    return <p>記事がありません。</p>;
  }

  return (
    <ul className="space-y-3">
      {recentArticles.map((article) => (
        <li key={article.id} className="rounded-md border p-3 hover:bg-accent">
          <Link to={`/content/${article.id}`}> {/* TODO: 記事詳細ページのパスを確認・修正 */}
            <h3 className="font-semibold">{article.metaTitle || 'タイトルなし'}</h3>
            <p className="text-sm text-muted-foreground">
              最終更新日: {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('ja-JP') : (article.createdAt ? new Date(article.createdAt).toLocaleDateString('ja-JP') : 'N/A')}
            </p>
          </Link>
        </li>
      ))}
      {recentArticles.length === 0 && <p>最近更新された記事はありません。</p>}
    </ul>
  );
}
