import { Link, NavLink, Form, useLocation, useFetcher, type NavLinkProps } from "react-router"; // react-router に変更し、NavLinkProps をインポート
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { CiLight } from "react-icons/ci";
import { MdDarkMode, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { Home, Search, FileText, Settings, LogOut, Link2, KeyRound, ChevronsUpDown, PlusCircle, type LucideIcon } from 'lucide-react'; // LucideIcon をインポート
import { cn } from "~/lib/utils";
import type { UserProfile, Project } from "~/types/user"; // UserProfile, Project をインポート

type Theme = "light" | "dark";

// ナビゲーションアイテムの型定義
interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavCategoryDef {
  category: string;
  icon: LucideIcon;
  items: NavItemDef[];
}

type CategorizedNavItemDef = NavItemDef | NavCategoryDef;

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  isSimpleLayoutPage?: boolean;
  userProfile: UserProfile | null;
  selectedProjectId: string | null;
}

/**
 * アプリケーションヘッダーコンポーネント
 * サイドバーのナビゲーションをヘッダーに統合
 * @param {HeaderProps} props - コンポーネントのプロパティ
 */
export function Header({
  theme,
  toggleTheme,
  onOpenMobileSidebar,
  isSimpleLayoutPage,
  userProfile,
  selectedProjectId,
}: HeaderProps) {
  const location = useLocation();
  const fetcher = useFetcher(); // プロジェクト切り替え用

  // ダッシュボードナビゲーションアイテム
  const dashboardNavItem: NavItemDef = { to: "/", label: "Dashboard", icon: Home };

  // カテゴリ分けされたナビゲーションアイテム (ダッシュボードを除く)
  const categorizedNavItems: CategorizedNavItemDef[] = [
    {
      category: "分析",
      icon: Search,
      items: [
        { to: "/scraping", label: "サイト分析", icon: Search },
        { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 },
      ],
    },
    {
      category: "コンテンツ",
      icon: FileText,
      items: [
        { to: "/content", label: "コンテンツ管理", icon: FileText },
        { to: "/keywords", label: "キーワード管理", icon: KeyRound },
        { to: "/keyword-article-mapping", label: "キーワード紐付け", icon: KeyRound },
      ],
    },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-background shadow-md fixed top-0 left-0 w-full z-50 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16"> {/* justify-between を削除 */}
        {/* ロゴ */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <img
              src="/lynx_logo_main.webp"
              alt="LYNX ロゴ"
              className="h-8 w-auto"
            />
          </Link>

          {/* プロジェクトセレクター (シンプルレイアウトページ以外で、ユーザープロファイルが存在する場合) */}
          {!isSimpleLayoutPage && userProfile && userProfile.projects && (
            <div className="ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[200px] justify-between">
                      <span className="truncate max-w-[150px]">
                        {userProfile.projects.find(p => p.id.toString() === selectedProjectId)?.projectUrl || "プロジェクト選択"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuLabel>プロジェクト切り替え</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userProfile.projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onSelect={() => {
                          if (project.id.toString() !== selectedProjectId) {
                            const formData = new FormData();
                            formData.append("selectedProjectId", project.id.toString());
                            // root.tsx の action を呼び出す
                            fetcher.submit(formData, { method: "post", action: "/" });
                          }
                        }}
                        disabled={project.id.toString() === selectedProjectId}
                      >
                        {project.projectName}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link to="/projects/new" className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        新規プロジェクト作成
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )}
        </div>

        {/* デスクトップ用ナビゲーション (シンプルレイアウトページ以外で表示) */}
        {!isSimpleLayoutPage && (
          <nav className="hidden md:flex items-center space-x-1 ml-6"> {/* ml-6 を追加してロゴとの間隔を調整 */}
            {/* ダッシュボードリンク */}
            <NavLink
              to={dashboardNavItem.to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            >
              <dashboardNavItem.icon className="mr-2 h-4 w-4" />
              {dashboardNavItem.label}
            </NavLink>

            {/* カテゴリ化されたナビゲーションアイテム */}
            {categorizedNavItems.map((navItemOrCategory) => {
              if ("category" in navItemOrCategory) {
                // カテゴリドロップダウン
                  const CategoryIcon = navItemOrCategory.icon;
                  return (
                    <DropdownMenu key={navItemOrCategory.category}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-primary",
                            // カテゴリ内のいずれかのアイテムがアクティブな場合にトリガーもアクティブ風にするか検討
                            navItemOrCategory.items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/')) && "bg-primary/10 text-primary"
                          )}
                        >
                          <CategoryIcon className="mr-2 h-4 w-4" />
                          {navItemOrCategory.category}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {navItemOrCategory.items.map((item) => (
                          <DropdownMenuItem key={item.label} asChild>
                            <NavLink
                              to={item.to}
                              className={({ isActive }) => cn(
                                "flex items-center w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-primary"
                              )}
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.label}
                            </NavLink>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                } else {
                  // 通常のナビゲーションアイテム
                  return (
                    <NavLink
                      key={navItemOrCategory.label}
                      to={navItemOrCategory.to}
                      className={({ isActive }) => cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-primary"
                      )}
                    >
                      <navItemOrCategory.icon className="mr-2 h-4 w-4" />
                      {navItemOrCategory.label}
                    </NavLink>
                  );
                }
              })}
            </nav>
          )}

        {/* 右側の要素（テーマ切り替え、ログアウトなど） */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-auto"> {/* ml-auto を追加して右寄せ */}
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
