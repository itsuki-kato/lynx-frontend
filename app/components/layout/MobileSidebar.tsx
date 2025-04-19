import { Link, Form, useLocation } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { Home, Search, FileText, Settings, LogOut, Link2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * モバイル用サイドバーナビゲーションコンポーネント (Sheet)
 * ヘッダーナビゲーションと同じアイテムを表示
 * @param {MobileSidebarProps} props - コンポーネントのプロパティ
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation(); // 現在のパスを取得
  
  // ヘッダーと同じナビゲーションアイテム
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/scraping", label: "サイト分析", icon: Search },
    { to: "/content", label: "コンテンツ管理", icon: FileText },
    { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

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
          <div className="flex-grow space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              
              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    to={item.to}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </div>
          {/* Logoutボタン */}
          <Form method="post" action="/logout" className="mt-auto">
            <SheetClose>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SheetClose>
          </Form>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
