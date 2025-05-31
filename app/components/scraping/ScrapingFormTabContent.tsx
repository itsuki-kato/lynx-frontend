import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { ScrapingForm } from "~/components/scraping/ScrapingForm";
import type { UseFormReturn } from "react-hook-form";
import type { ScrapyRequest } from '~/share/zod/schemas'; // ScrapyRequest 型をインポート
import type { CrawlStatus } from '~/types/scraping'; // CrawlStatus 型をインポート

interface ScrapingFormTabContentProps {
  form: UseFormReturn<ScrapyRequest>;
  onSubmit: (data: ScrapyRequest) => Promise<void>; // Promise<void> に修正
  crawlStatus: CrawlStatus; // CrawlStatus 型を使用
  onCancel: () => Promise<void>; // Promise<void> に修正
}

/**
 * スクレイピング設定フォームを表示するタブコンテンツコンポーネント
 */
export function ScrapingFormTabContent({
  form,
  onSubmit,
  crawlStatus,
  onCancel,
}: ScrapingFormTabContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>スクレイピング設定</CardTitle>
        <CardDescription>
          分析対象のURLとコンテンツを含むHTML要素のクラス名を入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrapingForm
          form={form}
          onSubmit={onSubmit}
          crawlStatus={crawlStatus}
          onCancel={onCancel}
        />
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          <p>※ スクレイピングはサーバーリソースを消費します。適切な間隔を空けてご利用ください。</p>
        </div>
      </CardContent>
    </Card>
  );
}
