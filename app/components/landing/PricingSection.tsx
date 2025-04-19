import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { pricingPlans } from "./data";
import { SectionTitle } from "./SectionTitle";

/**
 * 料金プランセクション
 */
export function PricingSection() {
  return (
    <section className="w-full py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6 text-center mx-auto">
        <SectionTitle 
          title="料金プラン"
          subtitle="あなたのビジネスに最適なプランをお選びいただけます"
        />
        
        <div className="flex flex-wrap justify-center gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`w-[350px] border ${
                plan.popular 
                  ? "border-emerald-600 shadow-xl relative -mt-6 scale-105 z-10" 
                  : "border-border shadow-lg"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 px-6 py-1.5 text-sm font-semibold">
                  人気プラン
                </Badge>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <p className={`${plan.isEnterprise ? "text-2xl font-bold" : "text-4xl font-extrabold"} text-emerald-600`}>
                  {plan.price}
                  {!plan.isEnterprise && <span className="text-sm text-muted-foreground font-normal">円/月</span>}
                </p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="py-3 border-b flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <li key={limitIndex} className="py-3 border-b flex items-center gap-3 text-muted-foreground">
                      <span className="opacity-50">×</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="w-full">
                  <Button 
                    variant={plan.isEnterprise ? "outline" : "default"}
                    className={`w-full ${
                      plan.isEnterprise 
                        ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50" 
                        : "bg-emerald-600 hover:bg-emerald-700"
                    } ${plan.popular ? "shadow-md" : ""}`}
                  >
                    {plan.isEnterprise ? "お問い合わせ" : "詳細を見る"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
