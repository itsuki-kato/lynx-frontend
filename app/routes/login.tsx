import { FcGoogle } from "react-icons/fc";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

/**
 * ログインページコンポーネント
 * LPのデザインに忠実に合わせたモダンなデザイン
 */
export default function Login() {
  return (
    // h-screenを削除し、flex-growを追加して親要素の高さいっぱいに広げる
    <section className="relative flex flex-grow w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* 背景装飾 - LPと同じスタイル */}
      <div className="absolute top-0 right-0 z-0 h-full w-1/2 rounded-bl-[100%] bg-gradient-to-r from-emerald-400/5 to-emerald-400/15" />
      
      <div className="container relative z-10 mx-auto flex flex-col items-center px-4 md:px-6">
        {/* ロゴ - LPと同じサイズ */}
        <img 
          src="/lynx_logo_main.webp" 
          alt="LYNX" 
          className="mb-10 h-16"
        />
        
        {/* タイトル - LPと同じフォントスタイル */}
        <h1 className="mb-6 text-center text-4xl font-extrabold leading-tight md:text-5xl">
          <span className="text-emerald-600 dark:text-emerald-400">LYNX</span>へようこそ
        </h1>
        
        {/* 説明文 - LPと同じスタイル */}
        <p className="mx-auto mb-10 max-w-xl text-center text-xl leading-relaxed text-muted-foreground">
          Googleアカウントでログインして、サイト管理を始めましょう
        </p>
        
        {/* ログインボタン - LPのボタンと同じスタイル */}
        <div className="mb-16">
          <a href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}>
            <Button 
              size="lg" 
              className="flex items-center gap-2 bg-emerald-600 px-8 py-6 text-lg font-bold text-white shadow-lg hover:bg-emerald-700"
            >
              <FcGoogle className="h-6 w-6" />
              <span>Googleでログイン</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </a>
        </div>
        
        {/* フッター情報 */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            ログインすることで、<a href="/terms" className="text-emerald-600 hover:underline dark:text-emerald-400">利用規約</a>と
            <a href="/privacy" className="text-emerald-600 hover:underline dark:text-emerald-400">プライバシーポリシー</a>に同意したことになります。
          </p>
          <p>© 2025 LYNX. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
}
