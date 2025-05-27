import { useLocation } from "react-router";
import type { UserProfile } from "~/types/user";
import type { Theme } from "~/types/navigation";
import { dashboardNavItem, categorizedNavItems } from "~/config/navigation";

import { Logo } from "./header/Logo";
import { ProjectSelector } from "./header/ProjectSelector";
import { DesktopNavigation } from "./header/DesktopNavigation";
import { ThemeToggleButton } from "./header/ThemeToggleButton";
import { LogoutButton } from "./header/LogoutButton";
import { MobileMenuButton } from "./header/MobileMenuButton";

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
 * ロゴ、プロジェクトセレクター、ナビゲーション、テーマ切り替え、ログアウト機能などを提供します。
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
  const currentPathname = location.pathname;

  return (
    <header className="bg-background shadow-md fixed top-0 left-0 w-full z-50 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        {/* ロゴとプロジェクトセレクター */}
        <div className="flex items-center">
          <Logo />
          {!isSimpleLayoutPage && (
            <ProjectSelector
              userProfile={userProfile}
              selectedProjectId={selectedProjectId}
            />
          )}
        </div>

        {/* デスクトップ用ナビゲーション */}
        {!isSimpleLayoutPage && (
          <DesktopNavigation
            dashboardNavItem={dashboardNavItem}
            categorizedNavItems={categorizedNavItems}
            currentPathname={currentPathname}
          />
        )}

        {/* 右側の要素 */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
          <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />

          {!isSimpleLayoutPage && <LogoutButton />}

          {!isSimpleLayoutPage && (
            <MobileMenuButton onOpenMobileSidebar={onOpenMobileSidebar} />
          )}
        </div>
      </div>
    </header>
  );
}
