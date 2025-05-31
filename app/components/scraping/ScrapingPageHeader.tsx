import React from 'react';

/**
 * スクレイピングページのヘッダーコンポーネント
 * ページ上部のタイトルと説明文を表示します。
 */
export function ScrapingPageHeader() {
  return (
    <div className="container max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">サイト分析ツール</h1>
      <p className="text-muted-foreground">
        URLとクラス名を入力して、ウェブサイトの構造を分析します。
      </p>
    </div>
  );
}
