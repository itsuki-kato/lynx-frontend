import { FcGoogle } from 'react-icons/fc';
import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { getSession, commitSession } from "~/server/session.server";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import type { Route } from '../+types/root';

interface LoaderData {
	toastMessage: { type: string; message: string } | null;
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const toastMessageString = session.get("toastMessage") as string | null;
	const toastMessage = toastMessageString ? JSON.parse(toastMessageString) : null;

	// フラッシュメッセージは取得するとセッションから削除されるので、
	// メッセージが削除されたセッションをコミットしてクライアントに返す
	const headers = new Headers();
	headers.append("Set-Cookie", await commitSession(session));
	headers.append("Content-Type", "application/json");

	return new Response(JSON.stringify({ toastMessage }), {
		status: 200,
		headers: headers,
	});
}

export default function Login() {
	const { toastMessage } = useLoaderData<LoaderData>();
	const { toast } = useToast();

	useEffect(() => {
		if (toastMessage && toast) {
			toast({
				variant: toastMessage.type === "error" ? "destructive" : "default",
				title: toastMessage.type === "error" ? "エラー" : "お知らせ",
				description: toastMessage.message,
			});
		}
	}, [toastMessage, toast]);

	return (
		// 背景画像を設定し、中央揃え、カバー表示にする
		<section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-login-bg bg-cover bg-center p-4">
			<Card className="relative z-10 w-full max-w-2xl bg-card/70 p-6 shadow-xl backdrop-blur-sm">
				<CardHeader className="items-center text-center">
					{/* ロゴ */}
					<img
						src="/lynx_logo_main.webp"
						alt="LYNX"
						className="mb-4 h-16"
					/>
					{/* タイトル */}
					<CardTitle className="text-3xl font-extrabold leading-tight md:text-4xl">
						<span className="text-emerald-600 dark:text-emerald-400">
							LYNX
						</span>
						へようこそ
					</CardTitle>
					{/* 説明文 */}
					<CardDescription className="mt-2 max-w-md text-lg leading-relaxed">
						Googleアカウントでログインして、サイト管理を始めましょう
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center">
					{/* ログインボタン */}
					<div className="my-8">
						<a
							href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
						>
							<Button
								size="lg"
								className="flex items-center gap-2 bg-emerald-600 px-8 py-6 text-lg font-bold text-white shadow-lg hover:bg-emerald-700"
							>
								<FcGoogle className="h-6 w-6" />
								<span>Googleでログイン</span>
								<ArrowRight className="h-5 w-5" />
							</Button>
						</a>
					</div>
				</CardContent>
				<CardFooter className="flex-col items-center text-center text-xs text-muted-foreground">
					{/* フッター情報 */}
					<p className="mb-2">
						ログインすることで、
						<a
							href="/terms"
							className="text-emerald-600 hover:underline dark:text-emerald-400"
						>
							利用規約
						</a>
						と
						<a
							href="/privacy"
							className="text-emerald-600 hover:underline dark:text-emerald-400"
						>
							プライバシーポリシー
						</a>
						に同意したことになります。
					</p>
					<p>© 2025 LYNX. All rights reserved.</p>
				</CardFooter>
			</Card>
		</section>
	);
}
