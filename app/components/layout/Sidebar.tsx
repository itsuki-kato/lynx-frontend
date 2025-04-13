import { NavLink, Form, useLocation } from "react-router"; // NavLinkとuseLocationをインポート
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Home, Search, FileText, Settings, LogOut, Link2 } from 'lucide-react'; // Link2アイコンを追加

/**
 * デスクトップ用サイドバーナビゲーションコンポーネント
 */
export function Sidebar() {
  const location = useLocation(); // 現在のパスを取得

  // ナビゲーションアイテムの定義 (アイコン追加)
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/scraping", label: "サイト分析", icon: Search },
    { to: "/content", label: "コンテンツ管理", icon: FileText },
    { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 }, // リンクアイコンに変更
    // { to: "/users", label: "Users", icon: Users }, // 必要に応じて追加
    // { to: "/reports", label: "Reports", icon: BarChart }, // 必要に応じて追加
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    // md以上で表示、固定幅、高さ、背景、ボーダー、影 - スタイルはshadcn/uiのテーマに沿うようにTailwindを使用
    <aside className="hidden md:flex flex-col fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-background border-r z-40"> {/* bg-background, borderを使用 */}
      <nav className="flex flex-col h-full p-4">
        <div className="flex-grow space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                location.pathname === item.to // 現在のパスと比較
                  ? "bg-muted text-primary hover:bg-muted" // アクティブ時のスタイル (shadcn/uiのクラスを使用)
                  : "text-muted-foreground hover:bg-muted hover:text-primary" // 非アクティブ時のスタイル
              )}
              asChild
            >
              <NavLink to={item.to}>
                <item.icon className="mr-2 h-4 w-4" /> {/* アイコン表示 */}
                {item.label}
              </NavLink>
            </Button>
          ))}
        </div>
        {/* Logoutボタン */}
        <Form method="post" action="/logout" className="mt-auto">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground" // ログアウトボタンのスタイル
          >
            <LogOut className="mr-2 h-4 w-4" /> {/* ログアウトアイコン */}
            Logout
          </Button>
        </Form>
      </nav>
    </aside>
  );
}
