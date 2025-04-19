import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowRight, Award } from "lucide-react";

/**
 * CTAセクション
 */
export function CtaSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto bg-background rounded-2xl p-12 shadow-xl text-center relative overflow-hidden">
          {/* 装飾要素 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-bl-full opacity-70" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/10 rounded-tr-full opacity-70" />
          
          <div className="relative z-10">
            <Badge className="bg-emerald-50 text-emerald-600 px-5 py-1.5 text-sm font-semibold mb-6 flex items-center gap-2 mx-auto w-fit">
              <Award className="h-4 w-4" />
              14日間無料トライアル
            </Badge>
            
            <h2 className="text-4xl font-extrabold mb-6">
              今すぐLYNXを体験してみませんか？
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              14日間の無料トライアルで、LYNXの全機能をお試しいただけます。<br />
              導入のサポートもしっかり行いますのでご安心ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-8 shadow-lg">
                  無料トライアルを始める
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  詳細資料をダウンロード
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
