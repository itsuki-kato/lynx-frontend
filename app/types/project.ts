// API仕様書の ProjectResponseDto に合わせる
export interface ProjectResponseDto {
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
export interface ProjectActionResponse {
  ok: boolean;
  fieldErrors?: {
    projectName?: string[];
    projectUrl?: string[];
    description?: string[];
  };
  apiErrors?: string;
}
