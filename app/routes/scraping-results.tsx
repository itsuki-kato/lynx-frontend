import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useActionData, Form } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { useAtom } from "jotai";
import { articlesAtom } from "~/atoms/article";
import type { ArticleItem } from "~/types/article";
import { useState, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { useToast } from "~/hooks/use-toast";
import { useResetAtom } from "jotai/utils";
import type { HeadingItem } from "~/types/article";
import { ArticleGrid } from "~/components/common/ArticleGrid"; // ArticleGridをインポート

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "スクレイピング結果" },
    { name: "description", content: "スクレイピング結果の表示" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  return { user };
};

// ArticleItem から ArticleDto への変換関数
function convertToArticleDto(article: ArticleItem) {
  return {
    articleUrl: article.articleUrl,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    isIndexable: article.isIndexable || false,
    internalLinks: article.internalLinks?.map(link => ({
      linkUrl: link.linkUrl,
      anchorText: link.anchorText || undefined,
      isFollow: link.isFollow || false,
      status: {
        code: link.status?.code || 0,
        redirectUrl: link.status?.redirectUrl || ""
      }
    })) || [],
    outerLinks: article.outerLinks?.map(link => ({
      linkUrl: link.linkUrl,
      anchorText: link.anchorText || undefined,
      isFollow: link.isFollow || false,
      status: {
        code: link.status?.code || 0,
        redirectUrl: link.status?.redirectUrl || ""
      }
    })) || [],
    headings: convertHeadings(article.headings || []),
    jsonLd: article.jsonLd || []
  };
}

// 再帰的に見出しを変換する関数
function convertHeadings(headings: HeadingItem[]): any[] {
  return headings.map(heading => ({
    tag: heading.tag,
    text: heading.text,
    children: heading.children ? convertHeadings(heading.children) : []
  }));
}

export const action = async ({ request }: Route.ActionArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "save") {
    try {
      // FormDataからarticlesDataを取得
      const articlesData = formData.get("articlesData");

      if (!articlesData) {
        return new Response(JSON.stringify({
          ok: false,
          error: "記事データが見つかりません"
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // APIを呼び出し
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scraping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: 1, // 固定値
          articles: JSON.parse(articlesData as string)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return new Response(JSON.stringify({
          ok: false,
          error: errorData.message || `API error: ${response.status}`
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Save error:", error);
      return new Response(JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "保存中にエラーが発生しました"
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return null;
};

export default function ScrapingResults() {
  const { user } = useLoaderData();
  const [results] = useAtom(articlesAtom);
  const resetArticles = useResetAtom(articlesAtom);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ArticleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const actionData = useActionData();
  const { toast } = useToast();
  const [saveCompleted, setSaveCompleted] = useState(false);

  /**
   * コンテンツ管理へボタンをクリックしたときの処理
   */
  const handleNavigateContent = () => {
    resetArticles(); // articlesAtomをリセット
    navigate("/content");
  }

  // 保存結果に応じてトースト通知を表示
  useEffect(() => {
    if (actionData) {
      if (actionData.ok) {
        toast({
          title: "保存完了",
          description: "スクレイピング結果をDBに保存しました",
          variant: "default",
        });

        setSaveCompleted(true);
      } else {
        toast({
          title: "エラー",
          description: actionData.error || "保存に失敗しました",
          variant: "destructive",
        });
      }
    }
  }, [actionData, toast]);

  // カードクリック時の処理
  const handleCardClick = (item: ArticleItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                スクレイピング結果
              </span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              取得した{results.length}件のデータを表示します
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/scraping")}
              className="text-gray-900 dark:text-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              スクレイピング画面に戻る
            </Button>

            {results.length > 0 && !saveCompleted ? (
              // 保存が完了していない場合は「DBに保存する」ボタンを表示
              <Form method="post">
                <input type="hidden" name="_action" value="save" />
                <input
                  type="hidden"
                  name="articlesData"
                  value={JSON.stringify(results.map(item => convertToArticleDto(item)))}
                />
                <Button
                  type="submit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  DBに保存する
                </Button>
              </Form>
            ) : saveCompleted && (
              // 保存が完了した場合は「コンテンツ管理へ」ボタンを表示
              <Button
                variant="outline"
                onClick={handleNavigateContent}
                className="text-gray-900 dark:text-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                コンテンツ管理へ
              </Button>
            )}
          </div>
        </div>

        {/* 記事グリッド表示 */}
        <ArticleGrid
          articles={results}
          onCardClick={handleCardClick}
          cardVariant="emerald" // ScrapingResultsではemeraldテーマを使用
          noDataMessage="スクレイピングを実行して結果を取得してください"
          noDataButtonText="スクレイピング画面へ"
          noDataButtonLink="/scraping"
        />
      </div>

      {/* 詳細表示モーダル */}
      {selectedItem && (
        <ScrapingResultModal
          item={selectedItem}
          isOpen={isDialogOpen}
          setOpen={setIsDialogOpen}
        />
      )}
    </div>
  );
}
