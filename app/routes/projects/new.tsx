import { type ActionFunctionArgs, redirect } from 'react-router'; // json を削除
import { Form, useActionData, useNavigation } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea'; // Textarea をインポート
import { getSession, commitSession } from '~/utils/session.server';
import { refreshAccessToken } from '~/utils/auth.server';

// Zodスキーマ定義 (API仕様に合わせて更新)
const projectSchema = z.object({
  projectName: z.string().min(1, { message: 'プロジェクト名は必須です。' }),
  projectUrl: z.string().url({ message: '有効なURLを入力してください。' }), // siteUrl から projectUrl に変更
  description: z.string().optional(), // description を追加 (オプショナル)
});

type ProjectFormData = z.infer<typeof projectSchema>;

// API仕様書の ProjectResponseDto に合わせる
interface ProjectResponseDto {
  id: number;
  workspaceId: number;
  projectUrl: string;
  projectName: string;
  description: string | null;
  lastAcquisitionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// actionが返す可能性のあるエラーの型
interface ProjectActionResponse {
  ok: boolean;
  fieldErrors?: {
    projectName?: string[];
    projectUrl?: string[]; // siteUrl から projectUrl に変更
    description?: string[];
  };
  apiErrors?: string;
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> { // 返り値は常にResponse
  const session = await getSession(request.headers.get('Cookie'));
  let token = session.get('token');
  const refreshToken = session.get('refreshToken');
  const formData = await request.formData();
  const rawProjectName = formData.get('projectName');
  const rawProjectUrl = formData.get('projectUrl'); // siteUrl から projectUrl に変更
  const rawDescription = formData.get('description'); // description を追加

  const validationResult = projectSchema.safeParse({
    projectName: rawProjectName,
    projectUrl: rawProjectUrl, // siteUrl から projectUrl に変更
    description: rawDescription, // description を追加
  });

  if (!validationResult.success) {
    const responseData: ProjectActionResponse = {
      ok: false,
      fieldErrors: validationResult.error.flatten().fieldErrors,
      apiErrors: "入力内容が無効です。"
    };
    return new Response(JSON.stringify(responseData), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { projectName, projectUrl, description } = validationResult.data; // siteUrl から projectUrl に変更、description を追加

  async function ensureValidToken() {
    if (!token && refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set('token', newTokens.accessToken);
        session.set('refreshToken', newTokens.refreshToken);
        token = newTokens.accessToken;
        return { newCookie: await commitSession(session) };
      } catch (error) {
        console.error('Token refresh failed in project creation action:', error);
        throw redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
      }
    }
    return { newCookie: null };
  }

  let cookieToSet: string | null = null;

  try {
    const tokenRefreshResult = await ensureValidToken();
    if (tokenRefreshResult.newCookie) {
      cookieToSet = tokenRefreshResult.newCookie;
    }

    if (!token) {
      throw redirect('/login');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ projectName, projectUrl, description }), // siteUrl から projectUrl に変更、description を追加
    });

    if (response.ok) {
      const newProject: ProjectResponseDto = await response.json(); // 型を適用
      session.set('selectedProjectId', newProject.id.toString());
      const finalCookie = cookieToSet ? [cookieToSet, await commitSession(session)].join(', ') : await commitSession(session);
      return redirect('/', {
        headers: { 'Set-Cookie': finalCookie },
      });
    } else if (response.status === 401 && refreshToken) {
      console.log('Project creation API returned 401, attempting token refresh...');
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        session.set('token', newTokens.accessToken);
        session.set('refreshToken', newTokens.refreshToken);
        token = newTokens.accessToken;

        const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectName, projectUrl, description }), // siteUrl から projectUrl に変更、description を追加
        });

        if (retryResponse.ok) {
          const newProject: ProjectResponseDto = await retryResponse.json(); // 型を適用
          session.set('selectedProjectId', newProject.id.toString());
          return redirect('/', {
            headers: { 'Set-Cookie': await commitSession(session) },
          });
        }
        const errorData = await retryResponse.json();
        const responseData: ProjectActionResponse = {
          ok: false,
          apiErrors: errorData.message || 'プロジェクトの作成に失敗しました。(再試行後)',
        };
        return new Response(JSON.stringify(responseData), {
          status: retryResponse.status,
          headers: { 'Content-Type': 'application/json', 'Set-Cookie': await commitSession(session) },
        });

      } catch (refreshError) {
        console.error('Token refresh failed during project creation retry:', refreshError);
        // エラー時はログインページへリダイレクトするが、セッションはコミットしておく
        return redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
      }
    } else {
      // APIからのその他のエラー
      const errorData = await response.json();
      const responseData: ProjectActionResponse = {
        ok: false,
        apiErrors: errorData.message || 'プロジェクトの作成に失敗しました。',
      };
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (cookieToSet) {
        headers.append('Set-Cookie', cookieToSet);
      }
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers,
      });
    }
  } catch (error) {
    // action内で redirect() が throw された場合や、予期せぬエラー
    if (error instanceof Response) {
      // redirect() の場合はそのまま返す
      return error;
    }
    console.error('Unexpected error in project creation action:', error);
    const responseData: ProjectActionResponse = {
      ok: false,
      apiErrors: '予期せぬエラーが発生しました。',
    };
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (cookieToSet) { // トークンリフレッシュ試行時のクッキーがあればセット
      headers.append('Set-Cookie', cookieToSet);
    }
    return new Response(JSON.stringify(responseData), {
      status: 500,
      headers,
    });
  }
}

export default function NewProjectPage() {
  const actionData = useActionData<ProjectActionResponse | undefined>(); // 型を修正
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  // actionDataがResponseインスタンスである可能性は低いので、型ガードを簡略化
  // actionDataがundefinedでないことを確認するだけで十分
  const fieldErrors = actionData?.fieldErrors;
  const apiError = actionData?.apiErrors;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            新しいプロジェクトを作成
          </CardTitle>
          <CardDescription className="text-center">
            分析したいウェブサイトの情報を入力してください。
          </CardDescription>
        </CardHeader>
        <Form method="post">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">プロジェクト名</Label>
              <Input
                id="projectName"
                type="text"
                placeholder="例: LYNX公式サイト分析"
                aria-invalid={fieldErrors?.projectName ? 'true' : 'false'}
                {...register('projectName')}
              />
              {errors.projectName && (
                <p className="text-sm text-red-500">{errors.projectName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectUrl">サイトURL</Label> {/* siteUrl から projectUrl に変更 */}
              <Input
                id="projectUrl" // siteUrl から projectUrl に変更
                type="url"
                placeholder="https://example.com"
                aria-invalid={errors.projectUrl ? 'true' : 'false'} // siteUrl から projectUrl に変更
                {...register('projectUrl')} // siteUrl から projectUrl に変更
              />
              {errors.projectUrl && ( // siteUrl から projectUrl に変更
                <p className="text-sm text-red-500">{errors.projectUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">プロジェクトの説明（任意）</Label>
              <Textarea
                id="description"
                placeholder="例: このプロジェクトは自社メディアのSEO分析を目的としています。"
                aria-invalid={errors.description ? 'true' : 'false'}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            {apiError && (
              <p className="text-sm text-red-500 text-center">{apiError}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : 'プロジェクトを作成'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
