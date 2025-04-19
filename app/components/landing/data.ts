import type { LucideIcon } from "lucide-react";

// 機能データ型定義
export interface Feature {
  id: number;
  title: string;
  description: string;
  iconName: string;
}

// 課題データ型定義
export interface Pain {
  text: string;
  iconName: string;
}

// メリットデータ型定義
export interface Benefit {
  title: string;
  description: string;
  iconName: string;
}

// 事例データ型定義
export interface Testimonial {
  name: string;
  position: string;
  company: string;
  image: string;
  quote: string;
}

// パートナー企業データ型定義
export interface Partner {
  name: string;
  logo: string;
}

// 料金プランデータ型定義
export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  isEnterprise?: boolean;
}

// 機能データ
export const features: Feature[] = [
  {
    id: 1,
    title: "サイト把握機能",
    description: "Webサイトをクロールし、各ページのSEO関連情報を収集・可視化します。サイト全体の状況を俯瞰的に把握できます。",
    iconName: "Search",
  },
  {
    id: 2,
    title: "内部リンク管理機能",
    description: "サイト内のページ間を繋ぐ内部リンク情報を抽出し、マトリクス形式で可視化・分析します。サイト全体のリンク構造を把握できます。",
    iconName: "Link",
  },
  {
    id: 3,
    title: "KW（キーワード）設計機能",
    description: "トピッククラスターモデルに基づいたキーワード戦略の設計・管理を支援します。",
    iconName: "Target",
  },
];

// 課題データ
export const pains: Pain[] = [
  {
    text: "効果が出るまでの時間が長く、進捗が見えづらい",
    iconName: "BarChart2",
  },
  {
    text: "キーワード選定が難しく、顧客の検索意図がつかみにくい",
    iconName: "Target",
  },
  {
    text: "順位やトラフィックの変動が激しく、安定しない",
    iconName: "BarChart2",
  },
  {
    text: "急な流入減少の原因がわからない",
    iconName: "Database",
  },
  {
    text: "コアアップデート時の対応がわからない",
    iconName: "Grid",
  },
];

// メリットデータ
export const benefits: Benefit[] = [
  {
    title: "SEOに必要なデータを一元管理",
    description: "サイトの構造、内部リンク、キーワードなど、SEOに関わるすべてのデータを一つのプラットフォームで管理可能です。",
    iconName: "Database",
  },
  {
    title: "内部リンク構造を視覚的に把握",
    description: "サイト内のリンク構造をグラフィカルに可視化。改善すべきポイントが一目でわかります。",
    iconName: "Link",
  },
  {
    title: "効果的なキーワード戦略の立案",
    description: "検索ボリュームや競合性を考慮した、最適なキーワード戦略を簡単に立案できます。",
    iconName: "Target",
  },
  {
    title: "戦略的なコンテンツ作成の土台",
    description: "ユーザーの検索意図に合わせたコンテンツ作成をサポートし、成果につながるSEO施策を実現します。",
    iconName: "CheckCircle",
  },
];

// 事例データ
export const testimonials: Testimonial[] = [
  {
    name: "山田 健太",
    position: "マーケティングディレクター",
    company: "株式会社テックフォワード",
    image: "/api/placeholder/70/70",
    quote: "LYNXを導入してから、SEO施策の効率が劇的に向上しました。特に内部リンク管理機能は、サイト構造の問題点を特定するのに非常に役立っています。",
  },
  {
    name: "佐藤 美咲",
    position: "SEOスペシャリスト",
    company: "デジタルマーケティング株式会社",
    image: "/api/placeholder/70/70",
    quote: "以前は複数のツールを使い分けていましたが、LYNXのおかげで作業時間が半分以下になりました。データに基づいた施策提案ができるようになり、クライアントからの評価も上がっています。",
  },
  {
    name: "鈴木 大輔",
    position: "Webディレクター",
    company: "クリエイティブウェブ株式会社",
    image: "/api/placeholder/70/70",
    quote: "キーワード設計機能が非常に使いやすく、コンテンツ制作チームとのコミュニケーションがスムーズになりました。SEO担当者必携のツールだと思います。",
  },
];

// パートナー企業データ
export const partners: Partner[] = [
  { name: "Google", logo: "/api/placeholder/120/40" },
  { name: "Microsoft", logo: "/api/placeholder/120/40" },
  { name: "Amazon", logo: "/api/placeholder/120/40" },
  { name: "IBM", logo: "/api/placeholder/120/40" },
  { name: "Oracle", logo: "/api/placeholder/120/40" },
  { name: "Salesforce", logo: "/api/placeholder/120/40" },
];

// 料金プランデータ
export const pricingPlans: PricingPlan[] = [
  {
    name: "スタンダードプラン",
    price: "50,000",
    description: "中小規模サイト向け",
    features: [
      "サイト把握機能",
      "内部リンク管理機能",
      "KW設計機能 (基本)",
    ],
    limitations: [
      "管理ページ数 5,000まで",
    ],
    popular: false,
  },
  {
    name: "プロフェッショナルプラン",
    price: "100,000",
    description: "中〜大規模サイト向け",
    features: [
      "サイト把握機能",
      "内部リンク管理機能",
      "KW設計機能 (高度)",
      "管理ページ数 20,000まで",
    ],
    limitations: [],
    popular: true,
  },
  {
    name: "エンタープライズプラン",
    price: "要問い合わせ",
    description: "大規模サイト・複数サイト管理向け",
    features: [
      "サイト把握機能",
      "内部リンク管理機能",
      "KW設計機能 (最上位)",
      "管理ページ数 無制限",
      "カスタム開発対応",
    ],
    limitations: [],
    popular: false,
    isEnterprise: true,
  },
];
