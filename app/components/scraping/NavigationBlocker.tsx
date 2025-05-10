import React from 'react';
import type { Blocker } from 'react-router';
import { Button } from '~/components/ui/button';

interface NavigationBlockerProps {
  blocker: Blocker;
  onConfirm: () => Promise<void>;
}

/**
 * スクレイピング処理中にページ遷移を試みた際に表示される確認ダイアログ
 */
export function NavigationBlocker({ blocker, onConfirm }: NavigationBlockerProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-medium text-foreground mb-3">
          処理の中断確認
        </h3>
        <p className="text-muted-foreground mb-5">
          スクレイピング処理が進行中です。このページを離れると処理が中断されます。本当に移動しますか？
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => blocker.reset()}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            移動する
          </Button>
        </div>
      </div>
    </div>
  );
}
