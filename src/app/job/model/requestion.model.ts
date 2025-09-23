export type Seniority = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';

export interface CreateRequestion {
  positionInFirm: string;
  description: string;
  programmingLanguages: string; // "Java, Spring, Angular"
  seniority: Seniority;
  location: string;
  budget: number;
}

export interface RequestionResponse extends CreateRequestion {
  id: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  createdAt: string;
}