import { useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

/**
 * ログアウトボタンコンポーネント
 * クリックすると確認ダイアログを表示し、承認後にログアウト処理を実行します。
 */
export function LogoutButton() {
  const submit = useSubmit();

  // ログアウト処理を実行するハンドラー
  const handleLogoutConfirm = () => {
    submit(null, { method: "post", action: "/logout" });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* ログアウトボタン */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:block flex items-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* ダイアログのタイトル */}
          <AlertDialogTitle>ログアウト確認</AlertDialogTitle>
        </AlertDialogHeader>
        {/* ダイアログの説明 */}
        <AlertDialogDescription>
          本当にログアウトしますか？
        </AlertDialogDescription>
        <AlertDialogFooter>
          {/* キャンセルボタン */}
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          {/* ログアウト実行ボタン */}
          <AlertDialogAction
            onClick={handleLogoutConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            ログアウト
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
