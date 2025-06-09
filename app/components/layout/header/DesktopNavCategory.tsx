import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronsUpDown } from 'lucide-react';
import { cn } from "~/lib/utils";
import type { NavCategoryDef, NavItemDef } from "~/types/navigation";

interface DesktopNavCategoryProps {
  category: NavCategoryDef;
  currentPathname: string;
}

/**
 * デスクトップナビゲーション用のカテゴリドロップダウンメニューコンポーネント
 * @param {DesktopNavCategoryProps} props - コンポーネントのプロパティ
 */
export function DesktopNavCategory({ category, currentPathname }: DesktopNavCategoryProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const CategoryIcon = category.icon;

  // カテゴリ内のアイテムがアクティブかどうかを判定する関数
  const isCategoryActive = () => {
    return category.items.some(item => currentPathname === item.to || currentPathname.startsWith(item.to + '/'));
  };

  const handleItemSelect = (item: NavItemDef) => {
    setIsMenuOpen(false); // メニューを閉じる
    navigate(item.to);    // プログラムでナビゲーション
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // トリガーで開閉状態をトグル
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
        {category.items.map((item) => {
          const ItemIcon = item.icon;
          const isActive = currentPathname === item.to || currentPathname.startsWith(item.to + '/');
          return (
            <DropdownMenuItem
              key={item.label}
              onSelect={() => handleItemSelect(item)}
              className={cn(
                "flex items-center w-full px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            >
              <ItemIcon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
