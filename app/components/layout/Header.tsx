import { Link, NavLink, Form, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { CiLight } from "react-icons/ci";
import { MdDarkMode, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { Home, Search, FileText, Settings, LogOut, Link2, KeyRound } from 'lucide-react';
import { cn } from "~/lib/utils";

type Theme = "light" | "dark";

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  isSimpleLayoutPage?: boolean;
}

/**
 * アプリケーションヘッダーコンポーネント
 * サイドバーのナビゲーションをヘッダーに統合
 * @param {HeaderProps} props - コンポーネントのプロパティ
 */
export function Header({ theme, toggleTheme, onOpenMobileSidebar, isSimpleLayoutPage }: HeaderProps) {
  const location = useLocation(); // 現在のパスを取得

  // ナビゲーションアイテムの定義
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/scraping", label: "サイト分析", icon: Search },
    { to: "/content", label: "コンテンツ管理", icon: FileText },
    { to: "/keywords", label: "キーワード管理", icon: KeyRound },
    { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-background shadow-md fixed top-0 left-0 w-full z-50 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* ロゴ */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <img
              src="/lynx_logo_main.webp"
              alt="LYNX ロゴ"
              className="h-8 w-auto"
            />
          </Link>

          {/* デスクトップ用ナビゲーション (ログインページ以外で表示) */}
          {!isSimpleLayoutPage && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* テーマ切り替えボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-primary focus:outline-none"
            aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
          >
            <IconContext.Provider value={{ size: "1.5rem" }}>
              {theme === "light" ? <CiLight /> : <MdDarkMode />}
            </IconContext.Provider>
          </Button>

          {/* ログアウトボタン (ログインページ以外で表示) */}
          {!isSimpleLayoutPage && (
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
          )}

          {/* モバイル用ハンバーガーメニュー (ログインページ以外で表示) */}
          {!isSimpleLayoutPage && (
            <div className="md:hidden">
              <Button
                variant="ghost"
              size="icon"
              onClick={onOpenMobileSidebar}
              className="text-muted-foreground"
              aria-label="ナビゲーションメニューを開く"
            >
              <MdMenu size={24} />
            </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
