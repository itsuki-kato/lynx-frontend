import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { pains } from "./data";
import { SectionTitle } from "./SectionTitle";
import { IconRenderer } from "./IconRenderer";

/**
 * 課題解決セクション
 */
export function PainPointsSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-muted/40 relative">
      <div className="container px-4 md:px-6">
        <SectionTitle 
          title={<>こんな<span className="text-emerald-600">悩み</span>はありませんか？</>}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pains.map((pain, index) => (
            <div 
              key={index} 
              className="bg-background rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow flex flex-col items-start gap-4"
            >
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                <IconRenderer name={pain.iconName} className="h-7 w-7" />
              </div>
              <p className="text-lg font-semibold">{pain.text}</p>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto bg-background p-10 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-emerald-600 text-center">
            LYNXはSEO担当者の課題を解決します
          </h3>
          <p className="text-lg text-muted-foreground mb-6 text-center leading-relaxed">
            SEOで成果を出すには、サイト管理、内部リンク構造の最適化、効果的なキーワード戦略が重要です。
            LYNXはこれらの要素を一元管理し、データに基づいた施策立案をサポートします。
          </p>
          <div className="flex justify-center">
            <Link to="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                詳細を見る
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
