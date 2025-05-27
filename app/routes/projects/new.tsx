import { redirect, Form, useActionData, useNavigation, useRouteLoaderData } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { projectSchema, type ProjectFormData } from '~/share/zod/schemas';
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
import { Textarea } from '~/components/ui/textarea';
import { getSession, commitSession } from '~/server/session.server';
import type { ProjectResponseDto } from '~/types/project';
import { PROJECTS_API_ENDPOINT } from '~/config/constants';
import type { loader as rootLoaderType } from '~/root';
import { createLoginRedirectResponse } from '~/server/auth.server';
import type { Route } from '../+types/logout';

// ProjectActionData 型の定義
type ProjectActionData = {
  success: boolean;
  message?: string;
  fieldErrors?: {
    projectName?: string[];
    projectUrl?: string[];
    description?: string[];
  };
};

// ヘルパー関数: プロジェクト作成API呼び出し
async function callCreateProjectApi(
  token: string,
  data: { projectName: string; projectUrl: string; description?: string | null },
) {
  return fetch(PROJECTS_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

// ヘルパー関数: 成功レスポンスの作成
async function createSuccessResponse(session: any, newProject: ProjectResponseDto) {
  session.set('selectedProjectId', newProject.id.toString());
  const finalSessionCookie = await commitSession(session);
  const headers = new Headers();
  headers.append('Set-Cookie', finalSessionCookie);

  // rootパスへのリダイレクト
  return redirect('/', { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token') as string | null;

  if (!token) {
    console.error("Action called without token, should have been caught by root loader.");
    // トークンがない場合はログインページへリダイレクト
    const loginRedirect = await createLoginRedirectResponse(session, true);
    return loginRedirect.redirectResponse;
  }

  const formData = await request.formData();
  const validationResult = projectSchema.safeParse({
    projectName: formData.get('projectName'),
    projectUrl: formData.get('projectUrl'),
    description: formData.get('description'),
  });

  if (!validationResult.success) {
    return {
      success: false,
      message: "入力内容が無効です。",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { projectName, projectUrl, description } = validationResult.data;

  try {
    const response = await callCreateProjectApi(token, { projectName, projectUrl, description });

    if (response.ok) {
      const newProject: ProjectResponseDto = await response.json();
      return createSuccessResponse(session, newProject);
    }

    const errorData = await response.json().catch(() => ({ message: 'プロジェクトの作成に失敗しました。APIからのエラー詳細取得失敗。' }));
    return {
      success: false,
      message: errorData.message || 'プロジェクトの作成に失敗しました。',
    };

  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Unexpected error in project creation action:', error);
    return {
      success: false,
      message: '予期せぬエラーが発生しました。',
    };
  }
}

export default function NewProjectPage() {
  const actionData = useActionData<ProjectActionData | undefined>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    formState: { errors: formHookErrors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  // actionDataからのエラーを取得
  const fieldErrors = actionData?.success === false ? actionData.fieldErrors : undefined;
  const generalApiError = actionData?.success === false && !actionData.fieldErrors ? actionData.message : undefined;


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
                aria-invalid={!!formHookErrors.projectName || !!fieldErrors?.projectName}
                {...register('projectName')}
              />
              {formHookErrors.projectName && (
                <p className="text-sm text-red-500">{formHookErrors.projectName.message}</p>
              )}
              {fieldErrors?.projectName && (
                <p className="text-sm text-red-500">{fieldErrors.projectName[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectUrl">サイトURL</Label>
              <Input
                id="projectUrl"
                type="url"
                placeholder="https://example.com"
                aria-invalid={!!formHookErrors.projectUrl || !!fieldErrors?.projectUrl}
                {...register('projectUrl')}
              />
              {formHookErrors.projectUrl && (
                <p className="text-sm text-red-500">{formHookErrors.projectUrl.message}</p>
              )}
              {fieldErrors?.projectUrl && (
                <p className="text-sm text-red-500">{fieldErrors.projectUrl[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">プロジェクトの説明（任意）</Label>
              <Textarea
                id="description"
                placeholder="例: このプロジェクトは自社メディアのSEO分析を目的としています。"
                aria-invalid={!!formHookErrors.description || !!fieldErrors?.description}
                {...register('description')}
              />
              {formHookErrors.description && (
                <p className="text-sm text-red-500">{formHookErrors.description.message}</p>
              )}
              {fieldErrors?.description && (
                <p className="text-sm text-red-500">{fieldErrors.description[0]}</p>
              )}
            </div>
            {generalApiError && (
              <p className="text-sm text-red-500 text-center">{generalApiError}</p>
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
