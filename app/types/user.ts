// プロジェクト情報の型定義 (ProjectResponseDto に相当)
export interface Project {
  id: number;
  workspaceId: number;
  projectUrl: string;
  projectName: string;
  description: string | null;
  lastAcquisitionDate: Date | string | null; // APIレスポンスが文字列の場合も考慮
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ユーザープロファイルの型定義
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  workspaceId: number | null;
  projects: Project[]; // projectIds から projects: Project[] に変更
}
