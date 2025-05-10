import { useState, useEffect } from 'react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { requireAuth } from '~/utils/auth.server';
import { getSession } from '~/utils/session.server';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { Keyword } from '~/types/keyword';
import { ScrollArea } from '~/components/ui/scroll-area';
import KeywordSelectionTable from '~/components/mapping/KeywordSelectionTable';
import ArticleSelectionTable from '~/components/mapping/ArticleSelectionTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Search, Link, XCircle, FileText, KeyRound } from 'lucide-react';

// Actionの戻り値の型
interface ActionData {
  success?: boolean;
  message?: string;
  error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const projectId = 1; // TODO: プロジェクト選択機能実装後に動的にする

  try {
    const articlesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/articles/minimal`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!articlesResponse.ok) {
      throw new Error(`記事一覧の取得に失敗しました: ${articlesResponse.status}`);
    }
    const articles: ArticleItem[] = await articlesResponse.json();

    const keywordsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords?projectId=${projectId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!keywordsResponse.ok) {
      throw new Error(`キーワード一覧の取得に失敗しました: ${keywordsResponse.status}`);
    }
    const keywords: Keyword[] = await keywordsResponse.json();

    return { articles, keywords, error: null };
  } catch (error) {
    console.error("データ取得エラー (記事・キーワード関連付け画面):", error);
    return {
      articles: [],
      keywords: [],
      error: error instanceof Error ? error.message : "データの取得中にエラーが発生しました。",
    };
  }
};

export const action = async ({ request }: ActionFunctionArgs): Promise<ActionData> => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const formData = await request.formData();

  const articleIdsString = formData.get("articleIds") as string;
  const keywordIdsString = formData.get("keywordIds") as string;

  if (!articleIdsString || !keywordIdsString) {
    return { error: "記事IDまたはキーワードIDが選択されていません。" };
  }

  const articleIds = articleIdsString.split(',');
  const keywordIds = keywordIdsString.split(',').map(Number);

  if (articleIds.length === 0 || keywordIds.length === 0) {
    return { error: "記事またはキーワードが選択されていません。" };
  }

  const results = [];
  for (const articleId of articleIds) {
    for (const keywordId of keywordIds) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/keywords/${keywordId}/articles/${articleId}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          results.push({ articleId, keywordId, success: false, status: response.status });
        } else {
          results.push({ articleId, keywordId, success: true, status: response.status });
        }
      } catch (e) {
        results.push({ articleId, keywordId, success: false, error: (e as Error).message });
      }
    }
  }

  const allSucceeded = results.every(r => r.success);
  const someSucceeded = results.some(r => r.success);

  if (allSucceeded) {
    return { success: true, message: "選択されたすべての記事とキーワードの関連付けに成功しました。" };
  } else if (someSucceeded) {
    return { success: false, message: "一部の関連付けに失敗しました。", error: "一部の関連付けに失敗しました。詳細はコンソールを確認してください。" };
  } else {
    return { success: false, error: "すべての関連付けに失敗しました。" };
  }
};

export default function KeywordArticleMappingPage() {
  const { articles, keywords, error: loaderError } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const { toast } = useToast();
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string | number>>(new Set());
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<number>>(new Set());
  const [articleSearchTerm, setArticleSearchTerm] = useState("");
  const [keywordSearchTerm, setKeywordSearchTerm] = useState("");
  // activeTab state は削除

  const handleArticleSelect = (articleId: string | number) => {
    setSelectedArticleIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(articleId)) {
        newSelectedIds.delete(articleId);
      } else {
        newSelectedIds.add(articleId);
      }
      return newSelectedIds;
    });
  };

  useEffect(() => {
    if (loaderError) {
      toast({ title: "データ読み込みエラー", description: loaderError, variant: "destructive" });
    }
  }, [loaderError, toast]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast({ title: "成功", description: fetcher.data.message });
        setSelectedArticleIds(new Set());
        setSelectedKeywordIds(new Set());
      } else {
        toast({ title: "エラー", description: fetcher.data.error || fetcher.data.message || "操作に失敗しました", variant: "destructive" });
      }
    }
  }, [fetcher.data, toast]);

  const handleAssociate = () => {
    if (selectedArticleIds.size === 0 || selectedKeywordIds.size === 0) {
      toast({ title: "選択エラー", description: "記事とキーワードをそれぞれ1つ以上選択してください。", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("articleIds", Array.from(selectedArticleIds).join(','));
    formData.append("keywordIds", Array.from(selectedKeywordIds).join(','));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="container mx-auto py-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">記事・キーワード関連付け</h1>
      </div>

      {loaderError && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          <p>エラー: {loaderError}</p>
        </div>
      )}

      <div className="space-y-6 flex-grow flex flex-col">
        <div className="flex flex-col mb-6"> {/* ボタンとテーブルエリアを縦並びにするコンテナ */}
          <div className="flex justify-between items-center mb-4"> {/* Badgeとボタンを横並びにするコンテナ */}
            <div> {/* Badgeを左寄せにするためのコンテナ */}
              <Badge variant="outline" className="text-sm px-3 py-1">
                選択中: 記事 {selectedArticleIds.size}件 / キーワード {selectedKeywordIds.size}件
              </Badge>
            </div>
            <div> {/* ボタンを右寄せにするためのコンテナ */}
              <Button
                onClick={handleAssociate}
                disabled={fetcher.state === "submitting" || selectedArticleIds.size === 0 || selectedKeywordIds.size === 0}
                className="flex items-center gap-2"
                size="default"
              >
                <Link size={16} />
                {fetcher.state === "submitting" ? "処理中..." : "関連付ける"}
              </Button>
            </div>
          </div>
          <div className="flex-grow"> {/* テーブルエリア */}
            <div className="flex flex-grow gap-6 md:gap-8 flex-col md:flex-row">
              {/* 左ペイン: 記事選択 (7割) */}
              <div className="md:w-7/10 flex flex-col">
                <Card className="flex flex-col flex-grow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText size={18} />
                      記事選択
                    </CardTitle>
                    <CardDescription>
                      関連付けたい記事を選択してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 pt-0">
                    <ScrollArea className="h-full">
                      <ArticleSelectionTable
                        articles={articles}
                        selectedArticleIds={selectedArticleIds}
                        onArticleSelect={handleArticleSelect}
                        searchTerm={articleSearchTerm}
                        onSearchTermChange={setArticleSearchTerm}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: キーワード選択 (3割) */}
              <div className="md:w-3/10 flex flex-col">
                <Card className="flex flex-col flex-grow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <KeyRound size={18} />
                      キーワード選択
                    </CardTitle>
                    <CardDescription>
                      関連付けたいキーワードを選択してください
                    </CardDescription>
                    <div className="relative mt-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="キーワードを検索..."
                        className="pl-8"
                        value={keywordSearchTerm}
                        onChange={(e) => setKeywordSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 pt-0">
                    {keywords.length > 0 ? (
                      <ScrollArea className="h-full">
                        <KeywordSelectionTable
                          keywords={keywords}
                          selectedKeywordIds={selectedKeywordIds}
                          onKeywordSelect={(keyword) => {
                            setSelectedKeywordIds(prevSelectedIds => {
                              const newSelectedIds = new Set(prevSelectedIds);
                              if (newSelectedIds.has(keyword.id)) {
                                newSelectedIds.delete(keyword.id);
                              } else {
                                newSelectedIds.add(keyword.id);
                              }
                              return newSelectedIds;
                            });
                          }}
                          searchTerm={keywordSearchTerm}
                        />
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <XCircle size={48} className="mb-2 opacity-50" />
                        <p>キーワードが見つかりません</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
