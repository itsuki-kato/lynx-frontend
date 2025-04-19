import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ReactElement } from "react";

interface IconRendererProps extends LucideProps {
  name: string;
}

/**
 * アイコン名からLucideアイコンをレンダリングするコンポーネント
 * 
 * @param name アイコン名（Lucideアイコン名）
 * @param props その他のLucideアイコンプロパティ
 */
export function IconRenderer({ name, ...props }: IconRendererProps) {
  // Lucideアイコンの型定義
  type IconType = (props: LucideProps) => ReactElement;
  
  // アイコン名からコンポーネントを取得
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as IconType;
  
  // アイコンが存在しない場合はnullを返す
  if (!Icon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }
  
  // アイコンをレンダリング
  return <Icon {...props} />;
}
