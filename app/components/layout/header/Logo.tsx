import { Link } from "react-router";

/**
 * LYNXアプリケーションのロゴコンポーネント
 * クリックするとホームページに遷移します。
 */
export function Logo() {
  return (
    <Link to="/" className="flex items-center mr-6">
      <img
        src="/lynx_logo_main.webp"
        alt="LYNX ロゴ"
        className="h-8 w-auto"
      />
    </Link>
  );
}
