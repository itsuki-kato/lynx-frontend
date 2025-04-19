import { ThemeProvider } from "~/components/ui/theme-provider";
import { HeroSection } from "~/components/landing/HeroSection";
import { PainPointsSection } from "~/components/landing/PainPointsSection";
import { FeaturesSection } from "~/components/landing/FeaturesSection";
import { TestimonialsSection } from "~/components/landing/TestimonialsSection";
import { BenefitsSection } from "~/components/landing/BenefitsSection";
import { PricingSection } from "~/components/landing/PricingSection";
import { CtaSection } from "~/components/landing/CtaSection";
import { FooterSection } from "~/components/landing/FooterSection";

// メタ情報
export function meta() {
  return [
    { title: "LYNX - サイト管理をもっと効率的に" },
    { name: "description", content: "ブロガーやアフィリエイター、自社のメディアサイトを運営しているWebマーケター向けのサイト管理ツール" },
  ];
}

/**
 * ランディングページ
 */
export default function Landing() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <div className="flex min-h-screen flex-col bg-background">
        <HeroSection />
        <PainPointsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <BenefitsSection />
        <PricingSection />
        <CtaSection />
        <FooterSection />
      </div>
    </ThemeProvider>
  );
}
