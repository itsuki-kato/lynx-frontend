import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import type { ScrapyRequest } from '~/share/zod/schemas';
import type { CrawlStatus } from '~/types/scraping';
import { Link2, Hash, Loader2, StopCircle } from 'lucide-react';

interface ScrapingFormProps {
  form: UseFormReturn<ScrapyRequest>;
  onSubmit: (values: ScrapyRequest) => Promise<void>;
  crawlStatus: CrawlStatus;
  onCancel: () => Promise<void>;
}

/**
 * スクレイピングフォームコンポーネント
 * 内部リンクマトリクス画面のスタイルに合わせて再構築
 */
export function ScrapingForm({ form, onSubmit, crawlStatus, onCancel }: ScrapingFormProps) {
  // スクレイピング実行中は中断ボタンのみ表示
  if (crawlStatus === 'running') {
    return (
      <div className="pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={() => onCancel()}
          className="w-full flex items-center justify-center gap-2"
        >
          <StopCircle className="h-4 w-4" />
          スクレイピングを中断する
        </Button>
      </div>
    );
  }

  // 通常時はフォームを表示
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="startUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Link2 className="h-4 w-4 mr-2 text-primary" />
                スクレイピングURL
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-start text-xs">
                スクレイピングを開始するURLを入力してください（必須）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-primary" />
                対象クラス名
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-start text-xs">
                スクレイピング対象のHTML要素のクラス名を入力してください（必須）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
          >
            <Loader2 className="h-4 w-4" />
            サイト分析を開始する
          </Button>
        </div>
      </form>
    </Form>
  );
}
