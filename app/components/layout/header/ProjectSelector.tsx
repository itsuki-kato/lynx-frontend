import { useFetcher, Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronsUpDown, PlusCircle } from 'lucide-react';
import type { UserProfile } from "~/types/user";

interface ProjectSelectorProps {
  userProfile: UserProfile | null;
  selectedProjectId: string | null;
}

/**
 * プロジェクト選択ドロップダウンメニューコンポーネント
 * ユーザーが関連付けられているプロジェクトを切り替える機能を提供します。
 * @param {ProjectSelectorProps} props - コンポーネントのプロパティ
 */
export function ProjectSelector({ userProfile, selectedProjectId }: ProjectSelectorProps) {
  const fetcher = useFetcher();

  // ユーザープロファイルが存在しない場合は何も表示しない (またはログインを促すメッセージなど)
  if (!userProfile) {
    // 例えば、ログインしていない場合は何も表示しないか、
    // ログインを促すシンプルなテキストやボタンを表示する
    return null; // または適切なプレースホルダー
  }

  // ユーザープロファイルは存在するが、プロジェクトがない場合
  if (!userProfile.projects || userProfile.projects.length === 0) {
    return (
      <div className="ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-[200px] justify-between">
              <span className="truncate max-w-[150px]">
                プロジェクトなし
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuLabel>プロジェクトがありません</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/projects/new" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                新規プロジェクト作成
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  /**
   * プロジェクトを選択したときの処理
   * ※ プロジェクトIDが変更された場合のみ、サーバーに選択を送信します。
   * @param {string} projectId - 選択されたプロジェクトのID
   * @returns
   */
  const handleSelectProject = (projectId: string) => {
    if (projectId !== selectedProjectId) {
      const formData = new FormData();
      formData.append("selectedProjectId", projectId);
      // root.tsx の action を呼び出す
      fetcher.submit(formData, { method: "post", action: "/" });
    }
  };

  // 現在選択されているプロジェクトを取得
  const currentProject = userProfile.projects.find(p => p.id.toString() === selectedProjectId);

  return (
    <div className="ml-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-[200px] justify-between">
            <span className="truncate max-w-[150px]">
              {currentProject?.projectUrl || "プロジェクト選択"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>プロジェクト切り替え</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userProfile.projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => handleSelectProject(project.id.toString())}
              disabled={project.id.toString() === selectedProjectId}
            >
              {project.projectName} ({project.projectUrl})
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/projects/new" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              新規プロジェクト作成
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
