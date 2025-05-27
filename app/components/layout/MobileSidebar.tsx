import { Link, Form, useLocation } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { dashboardNavItem, categorizedNavItems } from "~/config/navigation";
import type { NavItemDef } from "~/types/navigation";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ナビゲーションアイテムをフラットな配列に変換
 * ヘッダーナビゲーションと同じアイテムを表示
 * @returns {NavItemDef[]} フラットなナビゲーションアイテムの配列
 */
const getFlattenedNavItems = (): NavItemDef[] => {
  const flattenedItems: NavItemDef[] = [dashboardNavItem];

  categorizedNavItems.forEach(itemOrCategory => {
    if ('items' in itemOrCategory) {
      flattenedItems.push(...itemOrCategory.items);
    } else {
      flattenedItems.push(itemOrCategory);
    }
  });
  return flattenedItems;
};

/**
 * モバイル用サイドバーナビゲーションコンポーネント (Sheet)
 * ヘッダーナビゲーションと同じアイテムを表示
 * @param {MobileSidebarProps} props - コンポーネントのプロパティ
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation(); // 現在のパスを取得

  const navItemsToDisplay = getFlattenedNavItems();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link to="/" onClick={onClose} className="flex items-center">
              <img
                src="/lynx_logo_main.webp"
                alt="LYNX ロゴ"
                className="h-8 w-auto"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col h-[calc(100%-4rem)] p-4">
          <div className="flex-grow space-y-1 overflow-y-auto">
            {navItemsToDisplay.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </div>
          {/* Logoutボタン */}
          <Form method="post" action="/logout" className="mt-auto pt-4 border-t"> 
            <SheetClose asChild>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                onClick={onClose}
              >
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                Logout
              </Button>
            </SheetClose>
          </Form>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
