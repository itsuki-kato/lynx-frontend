import { NavLink } from "react-router";
import { cn } from "~/lib/utils";
import type { NavItemDef, NavLinkClassNameProp } from "~/types/navigation";

interface DesktopNavItemProps {
  item: NavItemDef;
  className?: NavLinkClassNameProp;
}

/**
 * デスクトップナビゲーション用の個々のリンクアイテムコンポーネント
 * @param {DesktopNavItemProps} props - コンポーネントのプロパティ
 */
export function DesktopNavItem({ item, className }: DesktopNavItemProps) {
  const IconComponent = item.icon;

  // デフォルトのclassName関数（NavLink用）
  const defaultClassName: NavLinkClassNameProp = ({ isActive }) =>
    cn(
      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-primary"
    );

  return (
    <NavLink
      to={item.to}
      className={className || defaultClassName}
    >
      <IconComponent className="mr-2 h-4 w-4" />
      {item.label}
    </NavLink>
  );
}
