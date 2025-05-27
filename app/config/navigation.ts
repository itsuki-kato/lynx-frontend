import { Home, Search, FileText, Settings, Link2, KeyRound } from 'lucide-react';
import type { NavItemDef, CategorizedNavItemDef } from '~/types/navigation';

/**
 * ダッシュボードへのナビゲーションアイテム定義
 */
export const dashboardNavItem: NavItemDef = {
  to: "/",
  label: "Dashboard",
  icon: Home,
};

/**
 * カテゴリ分けされたナビゲーションアイテムの定義
 * ダッシュボードは含まない
 */
export const categorizedNavItems: CategorizedNavItemDef[] = [
  {
    category: "分析",
    icon: Search,
    items: [
      { to: "/scraping", label: "サイト分析", icon: Search },
      { to: "/internal-link-matrix", label: "内部リンクマトリクス", icon: Link2 },
    ],
  },
  {
    category: "コンテンツ",
    icon: FileText,
    items: [
      { to: "/content", label: "コンテンツ管理", icon: FileText },
      { to: "/keywords", label: "キーワード管理", icon: KeyRound },
      { to: "/keyword-article-mapping", label: "キーワード紐付け", icon: KeyRound },
    ],
  },
  { to: "/settings", label: "Settings", icon: Settings },
];
