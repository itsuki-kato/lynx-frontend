import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { partners } from "./data";

/**
 * ランディングページのヒーローセクション
 */
export function HeroSection() {
  return (
    <section className="w-full py-24 lg:py-32 xl:py-40 relative overflow-hidden border-b border-border/40">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-emerald-400/5 to-emerald-400/15 rounded-bl-[100%] z-0" />
      
      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center mx-auto">
        <img 
          src="/lynx_logo_main.webp" 
          alt="LYNX" 
          className="h-16 mb-10"
        />
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-center leading-tight">
          SEOに必要な情報を<span className="text-emerald-600 dark:text-emerald-400">一元管理</span><br />
          <span className="text-emerald-600 dark:text-emerald-400 text-5xl md:text-6xl">効率的なSEO施策</span>を実現する
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-10 text-muted-foreground text-center leading-relaxed">
          LYNXは、SEOにおいて必要となるWebサイトの管理・分析作業を効率化するツールです。
          サイトの現状把握から、戦略立案、効果測定までを一貫してサポートします。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/login">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-8 py-6 text-lg font-bold shadow-lg">
              無料デモを予約する
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 px-8 py-6 text-lg font-bold">
              料金プランを見る
            </Button>
          </Link>
        </div>
        
        {/* ヒーロー画像 */}
        <div className="w-full max-w-5xl h-[400px] bg-muted rounded-xl shadow-xl overflow-hidden flex justify-center items-center">
          <p className="text-muted-foreground text-xl">LYNXダッシュボードイメージ</p>
        </div>
        
        {/* パートナー企業 */}
        <div className="mt-16 w-full flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-5 uppercase tracking-wider">
            信頼されるパートナー
          </p>
          <div className="flex justify-center flex-wrap gap-10 opacity-70">
            {partners.map((partner, index) => (
              <img 
                key={index} 
                src={partner.logo} 
                alt={partner.name} 
                className="h-8 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
