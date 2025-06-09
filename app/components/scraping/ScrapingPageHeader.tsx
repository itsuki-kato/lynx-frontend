import React from 'react';

/**
 * スクレイピングページのヘッダーコンポーネント
 * ページ上部のタイトルと説明文を表示します。
 */
export function ScrapingPageHeader() {
  return (
    <div className="container max-w-7xl mb-8">
      <h1 className="mb-6 text-2xl font-bold">サイト分析</h1>
      <p className="text-muted-foreground">
        URLとクラス名を入力して、ウェブサイトの構造を分析します。
      </p>
    </div>
  );
}
