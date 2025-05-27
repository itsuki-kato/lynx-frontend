import type { NavItemDef, CategorizedNavItemDef } from "~/types/navigation";
import { DesktopNavItem } from "./DesktopNavItem";
import { DesktopNavCategory } from "./DesktopNavCategory";

interface DesktopNavigationProps {
  dashboardNavItem: NavItemDef;
  categorizedNavItems: CategorizedNavItemDef[];
  currentPathname: string;
}

/**
 * デスクトップ用ナビゲーション全体のコンポーネント
 * ダッシュボードリンクとカテゴリ化されたナビゲーションアイテムを表示します。
 * @param {DesktopNavigationProps} props - コンポーネントのプロパティ
 */
export function DesktopNavigation({
  dashboardNavItem,
  categorizedNavItems,
  currentPathname,
}: DesktopNavigationProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1 ml-6">
      {/* ダッシュボードリンク */}
      <DesktopNavItem item={dashboardNavItem} />

      {/* カテゴリ化されたナビゲーションアイテム */}
      {categorizedNavItems.map((navItemOrCategory) => {
        if ("category" in navItemOrCategory) {
          // カテゴリドロップダウン
          return (
            <DesktopNavCategory
              key={navItemOrCategory.category}
              category={navItemOrCategory}
              currentPathname={currentPathname}
            />
          );
        } else {
          // 通常のナビゲーションアイテム
          return (
            <DesktopNavItem
              key={navItemOrCategory.label}
              item={navItemOrCategory}
            />
          );
        }
      })}
    </nav>
  );
}
