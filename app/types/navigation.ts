import type { LucideIcon } from 'lucide-react';
import type { NavLinkProps } from 'react-router'; // react-router-domからNavLinkPropsをインポート

/**
 * アプリケーションのテーマ（ライトモードまたはダークモード）
 */
export type Theme = "light" | "dark";

/**
 * 個々のナビゲーションリンクアイテムの定義
 */
export interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * サブアイテムを持つナビゲーションカテゴリの定義
 */
export interface NavCategoryDef {
  category: string;
  icon: LucideIcon;
  items: NavItemDef[];
}

/**
 * ナビゲーションアイテムまたはナビゲーションカテゴリのいずれかを表す共用体型
 */
export type CategorizedNavItemDef = NavItemDef | NavCategoryDef;

/**
 * NavLinkコンポーネントのclassNameプロパティの型
 * isActiveプロパティを持つオブジェクトを受け取り、文字列を返す関数
 */
export type NavLinkClassNameProp = NavLinkProps['className'];
