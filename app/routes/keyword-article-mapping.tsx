import React, { useState, useEffect } from 'react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { useLoaderData, useFetcher } from 'react-router';
import { requireAuth } from '~/utils/auth.server';
import { getSession } from '~/utils/session.server';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { Keyword } from '~/types/keyword';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea } from '~/components/ui/scroll-area';
import KeywordSelectionTable from '~/components/mapping/KeywordSelectionTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Search, Link, Link2Off, CheckCircle2, XCircle, FileText, KeyRound } from 'lucide-react';
import { cn } from '~/lib/utils';

interface LoaderData {
  articles: ArticleItem[];
  keywords: Keyword[];
  error?: string | null;
}

// Actionの戻り値の型
interface ActionData {
  success?: boolean;
  message?: string;
  error?: string;
  // 詳細なエラー情報 (例: どの関連付けに失敗したか) を含めることも可能
}

// 記事カードコンポーネント
interface ArticleCardProps {
  article: ArticleItem;
  isSelected: boolean;
  onSelect: () => void;
}

function ArticleCard({ article, isSelected, onSelect }: ArticleCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      )}
      onClick={onSelect}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base line-clamp-2">
          {article.metaTitle || 'タイトルなし'}
        </CardTitle>
        <CardDescription className="text-xs truncate">
          {article.articleUrl}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        {isSelected ? (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span>選択中</span>
          </Badge>
        ) : (
          <Badge variant="outline">選択する</Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const projectId = 1; // TODO: プロジェクト選択機能実装後に動的にする

  try {
    // 記事一覧の取得 (internal-link-matrix.tsx を参考)
    const articlesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/articles/minimal`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!articlesResponse.ok) {
      throw new Error(`記事一覧の取得に失敗しました: ${articlesResponse.status}`);
    }
    const articles: ArticleItem[] = await articlesResponse.json();

    console.log("取得した記事一覧:", articles);

    // キーワード一覧の取得 (keywords.tsx を参考)
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
            "Content-Type": "application/json", // ボディがない場合でも指定しておく
          },
        });
        if (!response.ok) {
          // 409 Conflict (既に存在する) はエラーとして扱わない場合もあるが、今回はシンプルにエラーとする
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
    // TODO: 詳細な失敗情報をクライアントに返す方法を検討
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
  const [activeTab, setActiveTab] = useState("create");

  // 記事の検索フィルタリング
  const filteredArticles = articles.filter(article => 
    article.metaTitle?.toLowerCase().includes(articleSearchTerm.toLowerCase()) || 
    article.articleUrl?.toLowerCase().includes(articleSearchTerm.toLowerCase())
  );

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

  // TODO: エラーハンドリングをUIに表示する
  useEffect(() => {
    if (loaderError) {
      toast({ title: "データ読み込みエラー", description: loaderError, variant: "destructive" });
    }
  }, [loaderError, toast]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast({ title: "成功", description: fetcher.data.message });
        // 成功時に関連付け情報を更新する処理 (例: 選択解除、再読み込みなど)
        setSelectedArticleIds(new Set());
        setSelectedKeywordIds(new Set());
        // TODO: 必要であれば revalidator.revalidate() でデータを再取得
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
        <div className="mt-4 md:mt-0">
          <Badge variant="outline" className="text-sm px-3 py-1">
            選択中: 記事 {selectedArticleIds.size}件 / キーワード {selectedKeywordIds.size}件
          </Badge>
        </div>
      </div>

      {loaderError && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          <p>エラー: {loaderError}</p>
        </div>
      )}

      <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Link size={16} />
            <span>新規関連付け</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Link2Off size={16} />
            <span>関連付け管理</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左ペイン: 記事選択 */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText size={18} />
                  記事選択
                </CardTitle>
                <CardDescription>
                  関連付けたい記事を選択してください
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="記事を検索..."
                    className="pl-8"
                    value={articleSearchTerm}
                    onChange={(e) => setArticleSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                {filteredArticles.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="grid grid-cols-1 gap-4">
                      {filteredArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          isSelected={selectedArticleIds.has(article.id!)}
                          onSelect={() => handleArticleSelect(article.id!)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <XCircle size={48} className="mb-2 opacity-50" />
                    <p>記事が見つかりません</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 右ペイン: キーワード選択 */}
            <Card className="flex flex-col">
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
                  <ScrollArea className="h-[500px] pr-4">
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
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <XCircle size={48} className="mb-2 opacity-50" />
                    <p>キーワードが見つかりません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleAssociate}
              disabled={fetcher.state === "submitting" || selectedArticleIds.size === 0 || selectedKeywordIds.size === 0}
              className="px-8 py-6 text-lg flex items-center gap-2"
              size="lg"
            >
              <Link size={18} />
              {fetcher.state === "submitting" ? "処理中..." : `選択した記事(${selectedArticleIds.size}件)にキーワード(${selectedKeywordIds.size}件)を関連付ける`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>関連付け管理</CardTitle>
              <CardDescription>
                既存の記事とキーワードの関連付けを管理します。この機能は今後実装予定です。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <Link2Off size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">この機能は現在開発中です</p>
                <p className="mt-2">今後のアップデートをお待ちください</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
