import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import type { ArticleItem } from '~/types/article';
import type { DashboardLoaderData } from '~/routes/dashboard';

export default function RewriteArticleSearch() {
  const { selectedProjectSummary, detailedArticles } = useLoaderData() as DashboardLoaderData;
  const [days, setDays] = useState<number>(30);
  const [searchedArticles, setSearchedArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedProjectSummary) {
      setError("プロジェクトが選択されていません。");
      setSearchedArticles([]);
      return;
    }
    if (days <= 0) {
      setError("日数は1以上の値を入力してください。");
      setSearchedArticles([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchedArticles([]);

    try {
      // detailedArticles を使用
      const now = new Date();
      const filteredArticles = detailedArticles.filter(article => {
        if (!article.updatedAt) return false; // updatedAt がない場合は除外
        const updatedAt = new Date(article.updatedAt);
        const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= days;
      });
      setSearchedArticles(filteredArticles);
    } catch (e) {
      console.error("Error searching articles:", e);
      setError("記事の検索中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysSinceUpdate = (updateDate: string | undefined) => {
    if (!updateDate) return 'N/A';
    const now = new Date();
    const updatedAt = new Date(updateDate);
    const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="mb-4 flex items-end space-x-2">
        <div className="flex-grow">
          <label htmlFor="days-input" className="mb-1 block text-sm font-medium text-muted-foreground">
            経過日数
          </label>
          <Input
            id="days-input"
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            min="1"
            placeholder="例: 30"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading || !selectedProjectSummary}>
          {isLoading ? '検索中...' : '検索'}
        </Button>
      </div>

      {error && <p className="mb-4 text-destructive">{error}</p>}

      {searchedArticles.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>最終更新日</TableHead>
              <TableHead>経過日数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchedArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.metaTitle}</TableCell>
                <TableCell>
                  <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {article.articleUrl}
                  </a>
                </TableCell>
                <TableCell>{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('ja-JP') : 'N/A'}</TableCell>
                <TableCell>{getDaysSinceUpdate(article.updatedAt)}{getDaysSinceUpdate(article.updatedAt) !== 'N/A' ? '日' : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!isLoading && searchedArticles.length === 0 && !error && days > 0 && (
        <p>該当する記事は見つかりませんでした。</p>
      )}
    </div>
  );
}
