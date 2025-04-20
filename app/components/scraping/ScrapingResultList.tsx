import type { ArticleItem } from "~/atoms/articles"; // 正しい型とパスに修正
import { ScrapingResultCard } from "./ScrapingResultCard";
import { ScrapingEmptyState } from "./ScrapingEmptyState";

interface ScrapingResultListProps {
  results: ArticleItem[]; // 型名を修正
  onSelectItem: (id: string) => void;
  isLoading: boolean;
}

export function ScrapingResultList({ results, onSelectItem, isLoading }: ScrapingResultListProps) {
  if (results.length === 0 && !isLoading) {
    return <ScrapingEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(item => (
        <ScrapingResultCard
          key={item.id}
          item={item}
          onClick={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
}
