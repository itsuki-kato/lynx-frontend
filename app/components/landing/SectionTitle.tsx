import type { ReactNode } from "react";

interface SectionTitleProps {
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center" | "right";
  accentColor?: boolean;
  lightMode?: boolean;
}

/**
 * セクションタイトルコンポーネント
 * 
 * @param title タイトルテキスト（ReactNodeなのでspanなどで一部強調可能）
 * @param subtitle サブタイトル（オプション）
 * @param align テキスト配置（デフォルトはcenter）
 * @param accentColor アクセントカラーの下線を表示するか（デフォルトはtrue）
 * @param lightMode 白色テーマ用（暗い背景上で使用する場合）
 */
export function SectionTitle({
  title,
  subtitle,
  align = "center",
  accentColor = true,
  lightMode = false,
}: SectionTitleProps) {
  const textAlign = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  const underlineColor = lightMode 
    ? "bg-white" 
    : "bg-emerald-600";

  return (
    <div className={`mb-16 ${textAlign}`}>
      <h2 className="text-4xl font-extrabold mb-4 relative">
        {title}
        {accentColor && (
          <span className={`block w-20 h-1 ${underlineColor} mx-auto mt-4 rounded-full`}></span>
        )}
      </h2>
      {subtitle && (
        <p className={`text-lg ${lightMode ? "text-white/80" : "text-muted-foreground"} mt-4 max-w-3xl mx-auto`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
