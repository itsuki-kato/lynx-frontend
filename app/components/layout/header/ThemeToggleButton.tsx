import { Button } from "~/components/ui/button";
import { CiLight } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import type { Theme } from "~/types/navigation";

interface ThemeToggleButtonProps {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * アプリケーションのテーマ（ライト/ダーク）を切り替えるボタンコンポーネント
 * @param {ThemeToggleButtonProps} props - コンポーネントのプロパティ
 */
export function ThemeToggleButton({ theme, toggleTheme }: ThemeToggleButtonProps) {
  return (
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
  );
}
