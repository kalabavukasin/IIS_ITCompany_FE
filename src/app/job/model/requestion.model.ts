export type Seniority = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';
export type RequestionStatus = 'DRAFT'|'PENDING_APPROVAL'|'APPROVED'|'REJECTED'|'CLOSED';

export interface CreateRequestion {
  positionInFirm: string;
  description: string;
  programmingLanguages: string; // "Java, Spring, Angular"
  seniority: Seniority;
  location: string;
  budget: number;
  pipelineWorkflowId: number;
}

export interface RequestionResponse {
  id: number;
  name: string;
  description: string;
  location: string;
  status: RequestionStatus;
  createdAt: string;
  createdById: number;
  createdByFullName: string;
  positionInFirm?: string;
  programmingLanguages?: string;
  seniority?: string;
  budget?: number;
}
export interface WorkflowSummary {
  id: number;
  name: string;
  version: number;
  active: boolean;
  stageNames: string[];
}
export interface TestDetailsDto {
  id: number;
  type?: string;
  inviteStatus?: string;
  deadline?: string;
  link?: string;

  passed?: boolean | null;
  score?: number | null;
}
export interface InterviewDetailsDto {
  id?: number;
  type?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  location?: string;
  status?: string;
}