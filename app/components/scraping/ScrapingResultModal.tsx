import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import type { ArticleItem } from "~/types/article";
import { ScrapingResultDisplay } from "./ScrapingResultDisplay";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";

interface Props {
  item: ArticleItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function ScrapingResultModal({
  item,
  isOpen,
  setOpen,
}: Props) {
  const [copied, setCopied] = useState(false);

  // URLをクリップボードにコピーする関数
  const copyToClipboard = () => {
    navigator.clipboard.writeText(item.articleUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background rounded-xl">
        {/* スティッキーヘッダー */}
        <div className="sticky top-0 z-10 bg-background border-b border-gray-200 dark:border-gray-700 rounded-t-xl shadow-sm">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* Badge のカスタムクラスを削除し、variant のみ使用 */}
                  <Badge variant={item.isIndexable ? "default" : "destructive"}>
                    {item.isIndexable ? "インデックス" : "ノーインデックス"}
                  </Badge>
                  
                  {item.jsonLd && item.jsonLd.length > 0 && (
                    /* Badge のカスタムクラスを削除し、variant="secondary" を使用 */
                    <Badge variant="secondary"> 
                      構造化データあり
                    </Badge>
                  )}
                </div>
                
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.metaTitle || "タイトルなし"}
                </DialogTitle>
              </div>
              
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">閉じる</span>
                </Button>
              </DialogClose>
            </div>
            
            <DialogDescription className="mt-2 flex items-center gap-2">
              <div className="flex-1 overflow-hidden">
                <a
                  href={item.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all overflow-wrap-anywhere flex items-center gap-1"
                >
                  <span className="truncate">{item.articleUrl}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "コピー済み" : "URLをコピー"}
              </Button>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-6 pt-4">
          <ScrapingResultDisplay item={item} />
        </div>

        {/* フッター */}
        <DialogFooter className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          
          <DialogClose asChild>
            {/* Button のカスタムクラスを削除 */}
            <Button variant="outline">
              <X className="h-4 w-4 mr-1" />
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
