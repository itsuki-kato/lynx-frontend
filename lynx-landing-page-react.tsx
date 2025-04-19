import { useState } from "react";
import { Search, Link, Target, CheckCircle, ArrowRight, Award, BarChart2, Database, Grid } from "lucide-react";

// スタイル定義
const styles = {
  // カラーテーマ
  colors: {
    primary: "#1D7268", // ロゴの緑色
    primaryLight: "#2A8A7F",
    primaryDark: "#155A52",
    secondary: "#F8F9FA",
    textDark: "#333333",
    textLight: "#FFFFFF",
    textGray: "#6C757D",
    bgLight: "#FFFFFF",
    bgGray: "#F5F5F5",
    border: "#E9ECEF",
  },
};

const LynxLandingPage = () => {
  // データを定義（loaderからの取得をシミュレート）
  const data = {
    features: [
      {
        id: 1,
        title: "サイト把握機能",
        description: "Webサイトをクロールし、各ページのSEO関連情報を収集・可視化します。サイト全体の状況を俯瞰的に把握できます。",
        icon: <Search size={28} />,
      },
      {
        id: 2,
        title: "内部リンク管理機能",
        description: "サイト内のページ間を繋ぐ内部リンク情報を抽出し、マトリクス形式で可視化・分析します。サイト全体のリンク構造を把握できます。",
        icon: <Link size={28} />,
      },
      {
        id: 3,
        title: "KW（キーワード）設計機能",
        description: "トピッククラスターモデルに基づいたキーワード戦略の設計・管理を支援します。",
        icon: <Target size={28} />,
      },
    ],
    pains: [
      {
        text: "効果が出るまでの時間が長く、進捗が見えづらい",
        icon: <BarChart2 size={28} />,
      },
      {
        text: "キーワード選定が難しく、顧客の検索意図がつかみにくい",
        icon: <Target size={28} />,
      },
      {
        text: "順位やトラフィックの変動が激しく、安定しない",
        icon: <BarChart2 size={28} />,
      },
      {
        text: "急な流入減少の原因がわからない",
        icon: <Database size={28} />,
      },
      {
        text: "コアアップデート時の対応がわからない",
        icon: <Grid size={28} />,
      },
    ],
    benefits: [
      {
        title: "SEOに必要なデータを一元管理",
        description: "サイトの構造、内部リンク、キーワードなど、SEOに関わるすべてのデータを一つのプラットフォームで管理可能です。",
        icon: <Database size={28} />,
      },
      {
        title: "内部リンク構造を視覚的に把握",
        description: "サイト内のリンク構造をグラフィカルに可視化。改善すべきポイントが一目でわかります。",
        icon: <Link size={28} />,
      },
      {
        title: "効果的なキーワード戦略の立案",
        description: "検索ボリュームや競合性を考慮した、最適なキーワード戦略を簡単に立案できます。",
        icon: <Target size={28} />,
      },
      {
        title: "戦略的なコンテンツ作成の土台",
        description: "ユーザーの検索意図に合わせたコンテンツ作成をサポートし、成果につながるSEO施策を実現します。",
        icon: <CheckCircle size={28} />,
      },
    ],
    testimonials: [
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
    ],
    partners: [
      { name: "Google", logo: "/api/placeholder/120/40" },
      { name: "Microsoft", logo: "/api/placeholder/120/40" },
      { name: "Amazon", logo: "/api/placeholder/120/40" },
      { name: "IBM", logo: "/api/placeholder/120/40" },
      { name: "Oracle", logo: "/api/placeholder/120/40" },
      { name: "Salesforce", logo: "/api/placeholder/120/40" },
    ],
  };
  
  const [activeTab, setActiveTab] = useState("feature1");

  return (
    <main style={{ fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* ヒーローセクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgLight, 
          padding: "100px 20px 80px",
          borderBottom: `1px solid ${styles.colors.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景装飾 */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: `linear-gradient(135deg, rgba(29,114,104,0.05) 0%, rgba(29,114,104,0.15) 100%)`,
          borderRadius: "0 0 0 100%",
          zIndex: 0,
        }} />
        
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          position: "relative", 
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <img 
            src="/api/placeholder/200/60" 
            alt="LYNX" 
            style={{ height: "60px", marginBottom: "40px" }}
          />
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "800", 
            marginBottom: "24px",
            color: styles.colors.textDark,
            textAlign: "center",
            lineHeight: 1.2,
          }}>
            SEOに必要な情報を<span style={{ color: styles.colors.primary }}>一元管理</span><br />
            <span style={{ color: styles.colors.primary, fontSize: "3.2rem" }}>効率的なSEO施策</span>を実現する
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            maxWidth: "800px", 
            margin: "0 auto 40px", 
            lineHeight: "1.8",
            color: styles.colors.textGray,
            textAlign: "center",
          }}>
            LYNXは、SEOにおいて必要となるWebサイトの管理・分析作業を効率化するツールです。
            サイトの現状把握から、戦略立案、効果測定までを一貫してサポートします。
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "60px" }}>
            <button style={{
              backgroundColor: styles.colors.primary,
              color: styles.colors.textLight,
              padding: "16px 32px",
              borderRadius: "8px",
              border: "none",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background-color 0.3s",
              boxShadow: "0 4px 12px rgba(29,114,104,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              無料デモを予約する
              <ArrowRight size={20} />
            </button>
            <button style={{
              backgroundColor: "transparent",
              color: styles.colors.primary,
              border: `2px solid ${styles.colors.primary}`,
              padding: "16px 32px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              料金プランを見る
            </button>
          </div>
          
          {/* ヒーロー画像 */}
          <div style={{
            width: "100%",
            maxWidth: "960px",
            height: "400px",
            backgroundColor: styles.colors.bgGray,
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <p style={{ color: styles.colors.textGray, fontSize: "1.2rem" }}>
              LYNXダッシュボードイメージ
            </p>
          </div>
          
          {/* パートナー企業 */}
          <div style={{ 
            marginTop: "60px", 
            width: "100%", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
          }}>
            <p style={{ 
              fontSize: "0.9rem", 
              color: styles.colors.textGray, 
              marginBottom: "20px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
              信頼されるパートナー
            </p>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              flexWrap: "wrap", 
              gap: "40px",
              opacity: 0.7,
            }}>
              {data.partners.map((partner, index) => (
                <img 
                  key={index} 
                  src={partner.logo} 
                  alt={partner.name} 
                  style={{ height: "30px", objectFit: "contain" }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 課題解決セクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgGray, 
          padding: "100px 20px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "60px",
            fontWeight: "800",
            color: styles.colors.textDark,
            textAlign: "center",
            position: "relative",
          }}>
            こんな<span style={{ color: styles.colors.primary }}>悩み</span>はありませんか？
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.primary,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "70px",
          }}>
            {data.pains.map((pain, index) => (
              <div key={index} style={{
                backgroundColor: styles.colors.bgLight,
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                width: "calc(33.33% - 30px)",
                minWidth: "300px",
                textAlign: "left",
                transition: "transform 0.3s, box-shadow 0.3s",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px",
              }}>
                <div style={{
                  color: styles.colors.primary,
                  backgroundColor: `rgba(29,114,104,0.1)`,
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {pain.icon}
                </div>
                <p style={{ 
                  fontSize: "18px",
                  lineHeight: "1.6",
                  color: styles.colors.textDark,
                  fontWeight: "600",
                  marginTop: "8px",
                }}>{pain.text}</p>
              </div>
            ))}
          </div>
          
          <div style={{ 
            maxWidth: "900px", 
            margin: "0 auto",
            backgroundColor: styles.colors.bgLight,
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ 
              fontSize: "1.8rem", 
              marginBottom: "24px",
              color: styles.colors.primary,
              fontWeight: "700",
              textAlign: "center",
            }}>
              LYNXはSEO担当者の課題を解決します
            </h3>
            <p style={{ 
              fontSize: "1.1rem", 
              lineHeight: "1.8",
              color: styles.colors.textGray,
              marginBottom: "24px",
              textAlign: "center",
            }}>
              SEOで成果を出すには、サイト管理、内部リンク構造の最適化、効果的なキーワード戦略が重要です。
              LYNXはこれらの要素を一元管理し、データに基づいた施策立案をサポートします。
            </p>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
            }}>
              <button style={{
                backgroundColor: styles.colors.primary,
                color: styles.colors.textLight,
                padding: "14px 28px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                詳細を見る
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgLight, 
          padding: "100px 20px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "60px",
            textAlign: "center",
            fontWeight: "800",
            color: styles.colors.textDark,
            position: "relative",
          }}>
            <span style={{ color: styles.colors.primary }}>3つの主要機能</span>でSEO業務を効率化
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.primary,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          
          {/* タブナビゲーション */}
          <div style={{
            display: "flex",
            borderBottom: `1px solid ${styles.colors.border}`,
            marginBottom: "50px",
            justifyContent: "center",
          }}>
            {data.features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(`feature${feature.id}`)}
                style={{
                  padding: "20px 32px",
                  fontSize: "18px",
                  fontWeight: "600",
                  backgroundColor: activeTab === `feature${feature.id}` ? styles.colors.bgLight : "transparent",
                  color: activeTab === `feature${feature.id}` ? styles.colors.primary : styles.colors.textGray,
                  border: "none",
                  borderBottom: activeTab === `feature${feature.id}` ? `4px solid ${styles.colors.primary}` : "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: activeTab === `feature${feature.id}` ? styles.colors.primary : styles.colors.textGray,
                }}>
                  {feature.icon}
                </span>
                {feature.title}
              </button>
            ))}
          </div>
          
          {/* タブコンテンツ */}
          {data.features.map((feature) => (
            activeTab === `feature${feature.id}` && (
              <div 
                key={feature.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "60px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1", minWidth: "400px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "24px",
                  }}>
                    <div style={{
                      backgroundColor: `rgba(29,114,104,0.1)`,
                      color: styles.colors.primary,
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ 
                      fontSize: "2rem", 
                      color: styles.colors.primary,
                      fontWeight: "700",
                    }}>
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p style={{ 
                    fontSize: "1.1rem", 
                    lineHeight: "1.8",
                    color: styles.colors.textGray,
                    marginBottom: "32px",
                  }}>
                    {feature.description}
                  </p>
                  
                  <ul style={{ 
                    paddingLeft: "0", 
                    listStyleType: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}>
                    <li style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "12px",
                      color: styles.colors.textDark,
                    }}>
                      <CheckCircle size={22} color={styles.colors.primary} />
                      <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>サイト内の全ページ情報を一元管理</span>
                    </li>
                    <li style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "12px",
                      color: styles.colors.textDark,
                    }}>
                      <CheckCircle size={22} color={styles.colors.primary} />
                      <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>改善が必要なページを簡単に特定</span>
                    </li>
                    <li style={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: "12px",
                      color: styles.colors.textDark,
                    }}>
                      <CheckCircle size={22} color={styles.colors.primary} />
                      <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>SEO施策の効果を可視化</span>
                    </li>
                  </ul>
                  
                  <button style={{
                    backgroundColor: styles.colors.primary,
                    color: styles.colors.textLight,
                    padding: "14px 28px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "32px",
                  }}>
                    詳細を見る
                    <ArrowRight size={18} />
                  </button>
                </div>
                
                <div style={{ 
                  flex: "1", 
                  minWidth: "450px",
                  backgroundColor: styles.colors.bgGray,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  height: "380px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <p style={{ color: styles.colors.textGray, fontSize: "1.1rem" }}>機能イメージ画像</p>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* 事例紹介セクション */}
      <section style={{ 
        backgroundColor: styles.colors.bgGray,
        padding: "100px 20px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "60px",
            textAlign: "center",
            fontWeight: "800",
            color: styles.colors.textDark,
            position: "relative",
          }}>
            導入<span style={{ color: styles.colors.primary }}>事例</span>
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.primary,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            justifyContent: "center",
            marginBottom: "50px",
          }}>
            {data.testimonials.map((testimonial, index) => (
              <div key={index} style={{
                backgroundColor: styles.colors.bgLight,
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                width: "calc(33.33% - 30px)",
                minWidth: "300px",
                display: "flex",
                flexDirection: "column",
              }}>
                <p style={{ 
                  fontSize: "1rem", 
                  color: styles.colors.textGray, 
                  lineHeight: "1.8", 
                  marginBottom: "24px",
                  flex: 1,
                }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    style={{ 
                      width: "60px", 
                      height: "60px", 
                      borderRadius: "50%", 
                      objectFit: "cover" 
                    }}
                  />
                  <div>
                    <p style={{ 
                      fontSize: "1.05rem", 
                      fontWeight: "600", 
                      color: styles.colors.textDark,
                      marginBottom: "4px", 
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{ 
                      fontSize: "0.85rem", 
                      color: styles.colors.textGray,
                      marginBottom: "2px",
                    }}>
                      {testimonial.position}
                    </p>
                    <p style={{ 
                      fontSize: "0.85rem", 
                      color: styles.colors.textGray,
                    }}>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: "center" }}>
            <button style={{
              backgroundColor: "transparent",
              color: styles.colors.primary,
              border: `2px solid ${styles.colors.primary}`,
              padding: "14px 28px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
              すべての事例を見る
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* メリットセクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.primary, 
          padding: "100px 20px",
          color: styles.colors.textLight,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "60px",
            fontWeight: "800",
            position: "relative",
          }}>
            LYNXを導入するメリット
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.textLight,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
          }}>
            {data.benefits.map((benefit, index) => (
              <div key={index} style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "36px 30px",
                width: "calc(50% - 30px)",
                minWidth: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "transform 0.3s",
              }}>
                <div style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}>
                  {benefit.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: "1.4rem", 
                  marginBottom: "16px",
                  fontWeight: "700",
                }}>
                  {benefit.title}
                </h3>
                <p style={{ 
                  fontSize: "1rem", 
                  lineHeight: "1.7",
                  opacity: "0.9",
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgLight, 
          padding: "100px 20px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "16px",
            fontWeight: "800",
            color: styles.colors.textDark,
            position: "relative",
          }}>
            料金プラン
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.primary,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          <p style={{ 
            fontSize: "1.1rem", 
            marginBottom: "60px",
            color: styles.colors.textGray,
          }}>
            あなたのビジネスに最適なプランをお選びいただけます
          </p>
          
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}>
            {/* スタンダードプラン */}
            <div style={{
              backgroundColor: styles.colors.bgLight,
              borderRadius: "12px",
              padding: "40px 30px",
              width: "350px",
              border: `1px solid ${styles.colors.border}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              textAlign: "left",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}>
              <h3 style={{ 
                fontSize: "1.4rem", 
                marginBottom: "8px",
                color: styles.colors.textDark,
                fontWeight: "700",
              }}>
                スタンダードプラン
              </h3>
              <p style={{ 
                fontSize: "2.5rem", 
                marginBottom: "16px",
                color: styles.colors.primary,
                fontWeight: "800",
              }}>
                50,000<span style={{ fontSize: "1rem", color: styles.colors.textGray }}>円/月</span>
              </p>
              <p style={{ 
                fontSize: "0.9rem", 
                marginBottom: "24px",
                color: styles.colors.textGray,
              }}>
                中小規模サイト向け
              </p>
              
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                marginBottom: "32px",
              }}>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  サイト把握機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  内部リンク管理機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  KW設計機能 (基本)
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textGray,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <span style={{ opacity: 0.5 }}>×</span>
                  管理ページ数 5,000まで
                </li>
              </ul>
              
              <button style={{
                width: "100%",
                backgroundColor: styles.colors.primary,
                color: styles.colors.textLight,
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}>
                詳細を見る
              </button>
            </div>
            
            {/* プロフェッショナルプラン */}
            <div style={{
              backgroundColor: styles.colors.bgLight,
              borderRadius: "12px",
              padding: "40px 30px",
              width: "350px",
              border: `1px solid ${styles.colors.primary}`,
              boxShadow: `0 10px 40px rgba(29,114,104,0.15)`,
              textAlign: "left",
              position: "relative",
              transform: "translateY(-20px) scale(1.05)",
              zIndex: 1,
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: styles.colors.primary,
                color: styles.colors.textLight,
                padding: "6px 20px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                letterSpacing: "1px",
              }}>
                人気プラン
              </div>
              
              <h3 style={{ 
                fontSize: "1.4rem", 
                marginBottom: "8px",
                color: styles.colors.textDark,
                fontWeight: "700",
              }}>
                プロフェッショナルプラン
              </h3>
              <p style={{ 
                fontSize: "2.5rem", 
                marginBottom: "16px",
                color: styles.colors.primary,
                fontWeight: "800",
              }}>
                100,000<span style={{ fontSize: "1rem", color: styles.colors.textGray }}>円/月</span>
              </p>
              <p style={{ 
                fontSize: "0.9rem", 
                marginBottom: "24px",
                color: styles.colors.textGray,
              }}>
                中〜大規模サイト向け
              </p>
              
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                marginBottom: "32px",
              }}>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  サイト把握機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  内部リンク管理機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  KW設計機能 (高度)
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  管理ページ数 20,000まで
                </li>
              </ul>
              
              <button style={{
                width: "100%",
                backgroundColor: styles.colors.primary,
                color: styles.colors.textLight,
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
                boxShadow: "0 4px 15px rgba(29,114,104,0.2)",
              }}>
                詳細を見る
              </button>
            </div>
            
            {/* エンタープライズプラン */}
            <div style={{
              backgroundColor: styles.colors.bgLight,
              borderRadius: "12px",
              padding: "40px 30px",
              width: "350px",
              border: `1px solid ${styles.colors.border}`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              textAlign: "left",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}>
              <h3 style={{ 
                fontSize: "1.4rem", 
                marginBottom: "8px",
                color: styles.colors.textDark,
                fontWeight: "700",
              }}>
                エンタープライズプラン
              </h3>
              <p style={{ 
                fontSize: "1.8rem", 
                marginBottom: "16px",
                color: styles.colors.primary,
                fontWeight: "700",
              }}>
                要問い合わせ
              </p>
              <p style={{ 
                fontSize: "0.9rem", 
                marginBottom: "24px",
                color: styles.colors.textGray,
              }}>
                大規模サイト・複数サイト管理向け
              </p>
              
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                marginBottom: "32px",
              }}>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  サイト把握機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  内部リンク管理機能
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  KW設計機能 (最上位)
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  管理ページ数 無制限
                </li>
                <li style={{ 
                  padding: "12px 0",
                  borderBottom: `1px solid ${styles.colors.border}`,
                  color: styles.colors.textDark,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <CheckCircle size={18} color={styles.colors.primary} />
                  カスタム開発対応
                </li>
              </ul>
              
              <button style={{
                width: "100%",
                backgroundColor: "transparent",
                color: styles.colors.primary,
                padding: "14px 24px",
                borderRadius: "8px",
                border: `2px solid ${styles.colors.primary}`,
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}>
                お問い合わせ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgGray, 
          padding: "100px 20px",
        }}
      >
        <div style={{ 
          maxWidth: "900px", 
          margin: "0 auto", 
          textAlign: "center",
          backgroundColor: styles.colors.bgLight,
          borderRadius: "16px",
          padding: "60px 40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 装飾要素 */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "150px",
            height: "150px",
            background: `radial-gradient(circle, rgba(29,114,104,0.1) 0%, rgba(255,255,255,0) 70%)`,
            borderRadius: "0 0 0 100%",
            zIndex: 0,
          }} />
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "200px",
            height: "200px",
            background: `radial-gradient(circle, rgba(29,114,104,0.08) 0%, rgba(255,255,255,0) 70%)`,
            borderRadius: "0 100% 0 0",
            zIndex: 0,
          }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center",
              backgroundColor: "rgba(29,114,104,0.1)",
              color: styles.colors.primary,
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "24px",
              gap: "8px",
            }}>
              <Award size={18} />
              <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>14日間無料トライアル</span>
            </div>
            
            <h2 style={{ 
              fontSize: "2.5rem", 
              marginBottom: "24px",
              fontWeight: "800",
              color: styles.colors.textDark,
            }}>
              今すぐLYNXを体験してみませんか？
            </h2>
            <p style={{ 
              fontSize: "1.2rem", 
              lineHeight: "1.8",
              marginBottom: "40px",
              color: styles.colors.textGray,
            }}>
              14日間の無料トライアルで、LYNXの全機能をお試しいただけます。<br />
              導入のサポートもしっかり行いますのでご安心ください。
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <button style={{
                backgroundColor: styles.colors.primary,
                color: styles.colors.textLight,
                padding: "16px 32px",
                borderRadius: "8px",
                border: "none",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background-color 0.3s",
                boxShadow: "0 8px 20px rgba(29,114,104,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                無料トライアルを始める
                <ArrowRight size={20} />
              </button>
              <button style={{
                backgroundColor: "transparent",
                color: styles.colors.primary,
                border: `2px solid ${styles.colors.primary}`,
                padding: "16px 32px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s",
              }}>
                詳細資料をダウンロード
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section 
        style={{ 
          backgroundColor: styles.colors.bgLight, 
          padding: "100px 20px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "16px",
            fontWeight: "800",
            color: styles.colors.textDark,
            position: "relative",
          }}>
            お問い合わせ
            <span style={{
              display: "block",
              width: "80px",
              height: "4px",
              backgroundColor: styles.colors.primary,
              margin: "16px auto 0",
              borderRadius: "2px",
            }}></span>
          </h2>
          <p style={{ 
            fontSize: "1.1rem", 
            marginBottom: "60px",
            color: styles.colors.textGray,
            maxWidth: "800px",
            margin: "0 auto 60px",
          }}>
            LYNXに関するご質問やお見積もり、カスタマイズのご相談など、お気軽にお問い合わせください。
            専門のスタッフが丁寧にご対応いたします。
          </p>
          
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px",
            justifyContent: "center",
            backgroundColor: styles.colors.bgGray,
            borderRadius: "16px",
            padding: "60px 40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}>
            <div style={{ 
              flex: "1",
              minWidth: "300px",
              textAlign: "left",
            }}>
              <h3 style={{ 
                fontSize: "1.5rem", 
                marginBottom: "24px",
                fontWeight: "700",
                color: styles.colors.textDark,
              }}>
                お問い合わせフォーム
              </h3>
              <p style={{ 
                fontSize: "1rem", 
                marginBottom: "32px",
                color: styles.colors.textGray,
                lineHeight: "1.7",
              }}>
                以下のフォームに必要事項をご記入の上、送信してください。
                通常2営業日以内にご返信いたします。
              </p>
              
              <div style={{ marginBottom: "40px" }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                  <label style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: "600", 
                    color: styles.colors.textDark, 
                  }}>
                    お名前
                  </label>
                  <span style={{ 
                    fontSize: "0.8rem", 
                    backgroundColor: "#E53E3E", 
                    color: "white", 
                    padding: "2px 8px", 
                    borderRadius: "4px",
                  }}>
                    必須
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="例：山田 太郎" 
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    border: `1px solid ${styles.colors.border}`,
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }} 
                />
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                  <label style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: "600", 
                    color: styles.colors.textDark, 
                  }}>
                    メールアドレス
                  </label>
                  <span style={{ 
                    fontSize: "0.8rem", 
                    backgroundColor: "#E53E3E", 
                    color: "white", 
                    padding: "2px 8px", 
                    borderRadius: "4px",
                  }}>
                    必須
                  </span>
                </div>
                <input 
                  type="email" 
                  placeholder="例：info@example.com" 
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    border: `1px solid ${styles.colors.border}`,
                    fontSize: "1rem",
                    marginBottom: "20px",
                  }} 
                />
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                  <label style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: "600", 
                    color: styles.colors.textDark, 
                  }}>
                    お問い合わせ内容
                  </label>
                  <span style={{ 
                    fontSize: "0.8rem", 
                    backgroundColor: "#E53E3E", 
                    color: "white", 
                    padding: "2px 8px", 
                    borderRadius: "4px",
                  }}>
                    必須
                  </span>
                </div>
                <textarea 
                  placeholder="お問い合わせ内容をご記入ください" 
                  style={{ 
                    width: "100%", 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    border: `1px solid ${styles.colors.border}`,
                    fontSize: "1rem",
                    height: "150px",
                    resize: "vertical",
                    marginBottom: "20px",
                  }} 
                />
                
                <button style={{
                  backgroundColor: styles.colors.primary,
                  color: styles.colors.textLight,
                  padding: "14px 28px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  width: "100%",
                }}>
                  送信する
                </button>
              </div>
            </div>
            
            <div style={{ 
              flex: "1",
              minWidth: "300px",
              textAlign: "left",
            }}>
              <h3 style={{ 
                fontSize: "1.5rem", 
                marginBottom: "24px",
                fontWeight: "700",
                color: styles.colors.textDark,
              }}>
                その他のお問い合わせ方法
              </h3>
              
              <div style={{ 
                backgroundColor: styles.colors.bgLight, 
                borderRadius: "12px", 
                padding: "24px", 
                marginBottom: "24px",
                border: `1px solid ${styles.colors.border}`,
              }}>
                <h4 style={{ 
                  fontSize: "1.1rem", 
                  marginBottom: "16px",
                  fontWeight: "700",
                  color: styles.colors.textDark,
                }}>
                  電話でのお問い合わせ
                </h4>
                <p style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "700", 
                  color: styles.colors.primary,
                  marginBottom: "8px",
                }}>
                  03-1234-5678
                </p>
                <p style={{ 
                  fontSize: "0.9rem", 
                  color: styles.colors.textGray,
                }}>
                  受付時間：平日 9:00〜18:00
                </p>
              </div>
              
              <div style={{ 
                backgroundColor: styles.colors.bgLight, 
                borderRadius: "12px", 
                padding: "24px", 
                border: `1px solid ${styles.colors.border}`,
              }}>
                <h4 style={{ 
                  fontSize: "1.1rem", 
                  marginBottom: "16px",
                  fontWeight: "700",
                  color: styles.colors.textDark,
                }}>
                  メールでのお問い合わせ
                </h4>
                <p style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "600", 
                  color: styles.colors.primary,
                  marginBottom: "8px",
                  wordBreak: "break-all",
                }}>
                  info@lynx-seo.jp
                </p>
                <p style={{ 
                  fontSize: "0.9rem", 
                  color: styles.colors.textGray,
                  marginBottom: "16px",
                }}>
                  24時間受付・通常2営業日以内にご返信
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer 
        style={{ 
          backgroundColor: styles.colors.bgLight, 
          padding: "80px 20px 20px",
          borderTop: `1px solid ${styles.colors.border}`,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: "60px",
            gap: "40px",
          }}>
            <div style={{ minWidth: "250px", maxWidth: "350px" }}>
              <img 
                src="/api/placeholder/150/40" 
                alt="LYNX" 
                style={{ height: "40px", marginBottom: "24px" }}
              />
              <p style={{ 
                fontSize: "1rem", 
                lineHeight: "1.8",
                color: styles.colors.textGray,
                marginBottom: "24px",
              }}>
                SEOに必要なWebサイトの管理・分析作業を効率化する次世代ツール。
                サイト把握、内部リンク管理、キーワード設計を一元管理します。
              </p>
              
              <div style={{ 
                display: "flex", 
                gap: "16px",
                marginBottom: "24px", 
              }}>
                <a href="#" style={{ 
                  width: "40px", 
                  height: "40px", 
                  backgroundColor: styles.colors.bgGray, 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: styles.colors.textGray,
                }}>
                  X
                </a>
                <a href="#" style={{ 
                  width: "40px", 
                  height: "40px", 
                  backgroundColor: styles.colors.bgGray, 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: styles.colors.textGray,
                }}>
                  f
                </a>
                <a href="#" style={{ 
                  width: "40px", 
                  height: "40px", 
                  backgroundColor: styles.colors.bgGray, 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: styles.colors.textGray,
                }}>
                  in
                </a>
              </div>
            </div>
            
            <div style={{ minWidth: "160px" }}>
              <h4 style={{ 
                fontSize: "1.1rem", 
                marginBottom: "24px",
                fontWeight: "700",
                color: styles.colors.textDark,
              }}>
                サービス
              </h4>
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    機能紹介
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    料金プラン
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    導入事例
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    お役立ち資料
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    API連携
                  </a>
                </li>
              </ul>
            </div>
            
            <div style={{ minWidth: "160px" }}>
              <h4 style={{ 
                fontSize: "1.1rem", 
                marginBottom: "24px",
                fontWeight: "700",
                color: styles.colors.textDark,
              }}>
                サポート
              </h4>
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    ヘルプセンター
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    お問い合わせ
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    よくある質問
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    活用ガイド
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    SEOブログ
                  </a>
                </li>
              </ul>
            </div>
            
            <div style={{ minWidth: "160px" }}>
              <h4 style={{ 
                fontSize: "1.1rem", 
                marginBottom: "24px",
                fontWeight: "700",
                color: styles.colors.textDark,
              }}>
                会社情報
              </h4>
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    会社概要
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    ニュースリリース
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    ブログ
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    採用情報
                  </a>
                </li>
                <li>
                  <a href="#" style={{ 
                    color: styles.colors.textGray,
                    textDecoration: "none",
                    transition: "color 0.3s",
                    fontSize: "0.95rem",
                  }}>
                    パートナー募集
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div style={{ 
            borderTop: `1px solid ${styles.colors.border}`, 
            paddingTop: "24px", 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "space-between", 
            alignItems: "center",
            gap: "20px",
          }}>
            <p style={{ 
              fontSize: "0.85rem", 
              color: styles.colors.textGray,
            }}>
              © 2025 LYNX. All rights reserved.
            </p>
            <div style={{ 
              display: "flex", 
              gap: "20px",
            }}>
              <a href="#" style={{ 
                color: styles.colors.textGray, 
                textDecoration: "none", 
                fontSize: "0.85rem",
              }}>
                プライバシーポリシー
              </a>
              <a href="#" style={{ 
                color: styles.colors.textGray, 
                textDecoration: "none", 
                fontSize: "0.85rem",
              }}>
                利用規約
              </a>
              <a href="#" style={{ 
                color: styles.colors.textGray, 
                textDecoration: "none", 
                fontSize: "0.85rem",
              }}>
                特定商取引法に基づく表記
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LynxLandingPage;