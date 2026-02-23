export interface JobPostingCard {
  id: number;
  name: string;
  description: string;
  location: string;
  salary: number | null;
  expires: string;
  createdAt: string;
  seniority: string | null;
  status: string;
}
export interface JobPostingDetail {
  id: number;
  name: string;
  description: string;
  location: string;
  seniority?: string;
  programmingLanguages?: string;
  budget?: number;
  openUntil: string;
  alreadyApplied: boolean;
}
export interface ApplicationDTO {
  id: number;
  candidateFullName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobPostingId: number;
  jobPostingName: string;
  currentStage: string;
  status: string;
  appliedAt: string;
}
export enum ApplicationStatus {
  ACTIVE = 'ACTIVE',
  WITHDRAWNT = 'WITHDRAWN',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED'
}