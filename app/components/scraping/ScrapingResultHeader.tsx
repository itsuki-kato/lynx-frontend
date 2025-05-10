import { ScrapingActionButtons } from "./ScrapingActionButtons";

interface ScrapingResultHeaderProps {
  resultsCount: number;
  onBack: () => void;
  onSave: () => void;
  isLoading: boolean;
  disableSave: boolean;
  title?: string;
  backText?: string;
}

export function ScrapingResultHeader({
  resultsCount,
  onBack,
  onSave,
  isLoading,
  disableSave,
  title = "スクレイピング結果",
  backText = "スクレイピング画面に戻る"
}: ScrapingResultHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-10">
      <div>
        <h1 className="text-3xl font-extrabold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
            {title}
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          取得した{resultsCount}件のデータを編集・管理できます
        </p>
      </div>

      <ScrapingActionButtons
        onBack={onBack}
        onSave={onSave}
        isLoading={isLoading}
        disableSave={disableSave}
        resultsCount={resultsCount}
        backText={backText}
      />
    </div>
  );
}
