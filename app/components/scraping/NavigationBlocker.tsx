import type { Blocker } from 'react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

interface NavigationBlockerProps {
  blocker: Blocker;
}

/**
 * スクレイピング処理中にページ遷移を試みた際に表示される確認ダイアログ
 */
export function NavigationBlocker({ blocker }: NavigationBlockerProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <AlertDialog open={blocker.state === "blocked"} onOpenChange={(open) => !open && blocker.reset()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>画面遷移がブロックされました</AlertDialogTitle>
          <AlertDialogDescription>
            スクレイピング処理が進行中です。他のページへの移動はできません。
            処理を続ける場合は、このダイアログを閉じてください。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset()}>
            閉じる
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
