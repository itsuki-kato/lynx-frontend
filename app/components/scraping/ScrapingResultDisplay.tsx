import type { ArticleItem } from "~/types/article";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultOuterLinks } from "./ScrapingResultOuterLinks";
import { ScrapingResultJsonLd } from "./ScrapingResultJsonLd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge"; // Badge をインポート
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Card コンポーネントをインポート
import { FileText, Link, ExternalLink, AlignLeft, Code, FileJson } from "lucide-react";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultDisplay({ item }: Props) {
  // タブの表示条件を事前に計算
  const hasInternalLinks = item.internalLinks && item.internalLinks.length > 0;
  const hasOuterLinks = item.outerLinks && item.outerLinks.length > 0;
  const hasHeadings = item.headings && item.headings.length > 0;
  const hasJsonLd = item.jsonLd && item.jsonLd.length > 0;

  return (
    <div className="py-2">
      <Tabs defaultValue="basic" className="w-full">
        {/* TabsList からカスタムスタイルを削除 */}
        <TabsList className="w-full flex flex-wrap h-auto justify-start rounded-lg mb-6 overflow-x-auto"> 
          {/* TabsTrigger からカスタムスタイルを削除 */}
          <TabsTrigger value="basic" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">基本情報</span>
          </TabsTrigger>

          {hasInternalLinks && (
            /* TabsTrigger からカスタムスタイルを削除 */
            <TabsTrigger value="internal-links" className="flex items-center gap-1.5">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">内部リンク</span>
              {/* span を Badge に変更 */}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {item?.internalLinks?.length}
              </Badge>
            </TabsTrigger>
          )}

          {hasOuterLinks && (
            /* TabsTrigger からカスタムスタイルを削除 */
            <TabsTrigger value="outer-links" className="flex items-center gap-1.5">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">外部リンク</span>
              {/* span を Badge に変更 */}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {item?.outerLinks?.length}
              </Badge>
            </TabsTrigger>
          )}

          {hasHeadings && (
            /* TabsTrigger からカスタムスタイルを削除 */
            <TabsTrigger value="headings" className="flex items-center gap-1.5">
              <AlignLeft className="h-4 w-4" />
              <span className="hidden sm:inline">見出し構造</span>
              {/* span を Badge に変更 */}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {item?.headings?.length}
              </Badge>
            </TabsTrigger>
          )}

          {hasJsonLd && (
            /* TabsTrigger からカスタムスタイルを削除 */
            <TabsTrigger value="json-ld" className="flex items-center gap-1.5">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">構造化データ</span>
              {/* span を Badge に変更 */}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {item?.jsonLd?.length}
              </Badge>
            </TabsTrigger>
          )}

          {/* TabsTrigger からカスタムスタイルを削除 */}
          <TabsTrigger value="all-json" className="flex items-center gap-1.5">
            <FileJson className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-2 transition-all duration-300">
          <TabsContent value="basic" className="m-0 animate-in fade-in-50 duration-300">
            <ScrapingResultBasicInfo item={item} />
          </TabsContent>

          {hasInternalLinks && (
            <TabsContent value="internal-links" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultInternalLinks item={item} />
            </TabsContent>
          )}

          {hasOuterLinks && (
            <TabsContent value="outer-links" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultOuterLinks item={item} />
            </TabsContent>
          )}

          {hasHeadings && (
            <TabsContent value="headings" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultHeadings item={item} />
            </TabsContent>
          )}

          {hasJsonLd && (
            <TabsContent value="json-ld" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultJsonLd item={item} />
            </TabsContent>
          )}

          {/* JSON 表示部分を Card でラップ */}
          <TabsContent value="all-json" className="m-0 animate-in fade-in-50 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  すべてのデータ（JSON）
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-muted/50 p-4 rounded-b-lg"> {/* 背景色を調整 */}
                <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
