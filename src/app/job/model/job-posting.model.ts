export interface JobPostingCard {
  id: number;
  name: string;
  description: string;
  location: string;
  salary: number | null;
  expires: string;
  createdAt: string;
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