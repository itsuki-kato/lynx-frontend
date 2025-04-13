import { Link, Form } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button"; // buttonVariants をインポート
import { Home, Search, FileText, Settings, LogOut, Link2 } from 'lucide-react'; // アイコンをインポート
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose, // Sheetを閉じるためのコンポーネント
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean; // Sheetの開閉状態
  onClose: () => void; // Sheetを閉じる関数
}

/**
 * モバイル用サイドバーナビゲーションコンポーネント (Sheet)
 * @param {MobileSidebarProps} props - コンポーネントのプロパティ
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // Sidebar.tsx と同じナビゲーションアイテムに更新
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/scraping", label: "サイト分析", icon: Search },
    { to: "/content", label: "コンテンツ管理", icon: FileText },
    { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 }, // 内部リンクマトリクスを追加
    // { to: "/users", label: "Users" }, // 不要なアイテムをコメントアウト
    // { to: "/reports", label: "Reports" }, // 不要なアイテムをコメントアウト
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0"> {/* 左から表示、パディング削除 */}
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link to="/" onClick={onClose} className="flex items-center"> {/* ロゴクリックで閉じる */}
              <img
                src="/lynx_logo_main.webp"
                alt="LYNX ロゴ"
                className="h-8 w-auto"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col h-[calc(100%-4rem)] p-4"> {/* ヘッダー分高さを調整 */}
          <div className="flex-grow space-y-1">
            {navItems.map((item) => (
              // SheetCloseでLinkを直接ラップし、ButtonのasChildを削除
              <SheetClose asChild key={item.label}>
                <Link
                  to={item.to}
                  // buttonVariantsとcnを使ってスタイルを適用
                  className={cn(
                    buttonVariants({ variant: "ghost" }), // 基本的なボタンスタイル
                    "w-full justify-start text-muted-foreground hover:bg-primary hover:text-primary-foreground" // カスタムスタイル
                  )}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />} {/* アイコン表示 */}
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </div>
          {/* Logoutボタン */}
          <Form method="post" action="/logout" className="mt-auto">
             {/* SheetCloseからasChildを削除 */}
             <SheetClose>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> {/* ログアウトアイコン */}
                Logout
              </Button>
            </SheetClose>
          </Form>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
