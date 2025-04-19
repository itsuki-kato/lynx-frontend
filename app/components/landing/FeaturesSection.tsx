import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowRight, CheckCircle } from "lucide-react";
import { features } from "./data";
import { SectionTitle } from "./SectionTitle";
import { IconRenderer } from "./IconRenderer";

/**
 * 機能紹介セクション
 */
export function FeaturesSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <SectionTitle 
          title={<><span className="text-emerald-600">3つの主要機能</span>でSEO業務を効率化</>}
        />
        
        {/* タブナビゲーション */}
        <Tabs defaultValue={`feature${features[0].id}`} className="w-full max-w-5xl mx-auto mb-16">
          <TabsList className="w-full justify-center border-b mb-8 bg-transparent">
            {features.map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={`feature${feature.id}`}
                className="data-[state=active]:border-b-4 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 py-5 px-8 text-lg font-semibold flex items-center gap-3"
              >
                <span className="text-current">
                  <IconRenderer name={feature.iconName} className="h-7 w-7" />
                </span>
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {features.map((feature) => (
            <TabsContent key={feature.id} value={`feature${feature.id}`} className="mt-0">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
                      <IconRenderer name={feature.iconName} className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-600">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-lg">
                      <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
                      <span className="font-medium">サイト内の全ページ情報を一元管理</span>
                    </li>
                    <li className="flex items-start gap-3 text-lg">
                      <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
                      <span className="font-medium">改善が必要なページを簡単に特定</span>
                    </li>
                    <li className="flex items-start gap-3 text-lg">
                      <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
                      <span className="font-medium">SEO施策の効果を可視化</span>
                    </li>
                  </ul>
                  
                  <Link to="/login">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 mt-4">
                      詳細を見る
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex-1 min-w-[300px] bg-muted rounded-xl shadow-lg h-[380px] flex justify-center items-center">
                  <p className="text-muted-foreground text-lg">機能イメージ画像</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
