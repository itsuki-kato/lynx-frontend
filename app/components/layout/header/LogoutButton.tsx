import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { LogOut } from 'lucide-react';

/**
 * ログアウトボタンコンポーネント
 * クリックするとログアウト処理を実行します。
 */
export function LogoutButton() {
  return (
    <Form method="post" action="/logout" className="hidden md:block">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="flex items-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </Form>
  );
}
