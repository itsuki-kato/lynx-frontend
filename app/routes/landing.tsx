import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { ThemeProvider } from "~/components/ui/theme-provider";

// メタ情報
export function meta() {
  return [
    { title: "LYNX - サイト管理をもっと効率的に" },
    { name: "description", content: "ブロガーやアフィリエイター、自社のメディアサイトを運営しているWebマーケター向けのサイト管理ツール" },
  ];
}

export default function Landing() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <div className="flex min-h-screen flex-col bg-background">
        {/* ヒーローセクション */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-400 sm:text-5xl xl:text-6xl/none">
                    LYNX
                  </h1>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    サイト管理をもっと効率的に
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ブロガーやアフィリエイター、自社のメディアサイトを運営しているWebマーケター向けのサイト管理ツール。
                    内部リンクの関係性を可視化・管理して、SEOパフォーマンスを向上させましょう。
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/login">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                      今すぐ始める
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {/* ここにイメージやイラストを配置 */}
                <div className="h-[350px] w-[350px] rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-70 blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  主な機能
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LYNXは、Webサイト運営者のための包括的なツールセットを提供します
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>内部リンク相関表</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>記事内の内部リンクの相関表をマップで表示し、視覚的にどの記事に内部リンクがある/ないのか判断できます。</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Webサイトスクレイピング</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Webサイトの情報をスクレイピング・取得して編集・DBに保存することができます。</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>ダッシュボード</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>DBから取得したWebサイトのコンテンツ情報の分析レポートを表示します。</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  今すぐLYNXを始めましょう
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Googleアカウントで簡単に登録・ログインできます。
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link to="/login" className="w-full">
                  <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    ログイン / 会員登録
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="w-full py-6 md:py-12 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  © 2025 LYNX. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
