import { useLoaderData } from 'react-router';
import { Link } from 'react-router';
import type { DashboardLoaderData } from '~/routes/dashboard';

const MAX_KEY_KEYWORDS = 5; // 表示する最大キーワード数

// キーワードの重要度を数値に変換するヘルパー関数 (ソート用)
const getImportanceScore = (importance: string | null | undefined): number => {
  if (!importance) return 0;
  switch (importance.toLowerCase()) {
    case '高':
    case 'high':
      return 3;
    case '中':
    case 'medium':
      return 2;
    case '低':
    case 'low':
      return 1;
    default:
      return 0;
  }
};

export default function KeyKeywords() {
  const { keywords } = useLoaderData() as DashboardLoaderData;

  if (!keywords || keywords.length === 0) {
    return <p>キーワードが登録されていません。</p>;
  }

  // 重要度 > 検索ボリューム の優先順位でソート
  const sortedKeywords = [...keywords].sort((a, b) => {
    const importanceA = getImportanceScore(a.importance);
    const importanceB = getImportanceScore(b.importance);

    if (importanceA !== importanceB) {
      return importanceB - importanceA; // 重要度が高い順
    }
    // 重要度が同じ場合は検索ボリュームでソート
    return (b.searchVolume || 0) - (a.searchVolume || 0); // 検索ボリュームが多い順
  });

  const keyKeywords = sortedKeywords.slice(0, MAX_KEY_KEYWORDS);

  return (
    <ul className="space-y-3">
      {keyKeywords.map((keyword) => (
        <li key={keyword.id} className="rounded-md border p-3 hover:bg-accent">
          {/* TODO: キーワード詳細ページのパスを確認・修正 */}
          <Link to={`/keywords/${keyword.id}`}>
            <h3 className="font-semibold">{keyword.keywordName}</h3>
            <div className="text-sm text-muted-foreground">
              <span>
                重要度: {keyword.importance || 'N/A'}
              </span>
              <span className="ml-2">
                検索Vol: {keyword.searchVolume?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </Link>
        </li>
      ))}
      {keyKeywords.length === 0 && <p>表示する主要キーワードはありません。</p>}
    </ul>
  );
}
