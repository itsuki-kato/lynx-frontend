import { Button } from "~/components/ui/button";
import { MdMenu } from "react-icons/md";

interface MobileMenuButtonProps {
  onOpenMobileSidebar: () => void;
}

/**
 * モバイル表示時にサイドバーを開くためのハンバーガーメニューボタンコンポーネント
 * @param {MobileMenuButtonProps} props - コンポーネントのプロパティ
 */
export function MobileMenuButton({ onOpenMobileSidebar }: MobileMenuButtonProps) {
  return (
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
  );
}
