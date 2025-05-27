import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronsUpDown } from 'lucide-react';
import { cn } from "~/lib/utils";
import type { NavCategoryDef } from "~/types/navigation";
import { DesktopNavItem } from "./DesktopNavItem";

interface DesktopNavCategoryProps {
  category: NavCategoryDef;
  currentPathname: string;
}

/**
 * デスクトップナビゲーション用のカテゴリドロップダウンメニューコンポーネント
 * @param {DesktopNavCategoryProps} props - コンポーネントのプロパティ
 */
export function DesktopNavCategory({ category, currentPathname }: DesktopNavCategoryProps) {
  const CategoryIcon = category.icon;

  // カテゴリ内のアイテムがアクティブかどうかを判定する関数
  const isCategoryActive = () => {
    return category.items.some(item => currentPathname === item.to || currentPathname.startsWith(item.to + '/'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-primary",
            isCategoryActive() && "bg-primary/10 text-primary"
          )}
        >
          <CategoryIcon className="mr-2 h-4 w-4" />
          {category.category}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {category.items.map((item) => (
          <DropdownMenuItem key={item.label} asChild>
            {/* DesktopNavItem を使用してドロップダウン内のアイテムをレンダリング */}
            <DesktopNavItem
              item={item}
              className={({ isActive }) => cn(
                "flex items-center w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
