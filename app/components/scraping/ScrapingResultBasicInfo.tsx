import { useState } from "react";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  item: EditableScrapingResultItem;
  onUpdate?: () => Promise<void>;
}

export function ScrapingResultBasicInfo({ item, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
        {onUpdate && (
          <Button
            onClick={handleUpdate}
            variant="outline"
            size="sm"
            disabled={isUpdating}
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
            更新
          </Button>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {/* URL */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 break-all">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {item.url}
              </a>
            </dd>
          </div>
          
          {/* タイトル */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">タイトル</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
              {item.title || "タイトルなし"}
            </dd>
          </div>
          
          {/* 説明文 */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">説明文（メタディスクリプション）</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
              {item.content || "説明文なし"}
            </dd>
          </div>
          
          {/* インデックス状態 */}
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">インデックス状態</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.index_status === 'index' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.index_status === 'index' ? 'インデックス' : 'ノーインデックス'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
