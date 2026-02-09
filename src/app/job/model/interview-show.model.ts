export type InterviewType =
  | 'HR_SCREEN'
  | 'TECHNICAL'
  | 'SYSTEM_DESIGN'
  | 'MANAGERIAL'
  | 'FINAL';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export interface InterviewToShowDTO {
  id: number;
  type: InterviewType;
  location: string;
  candidateName: string;
  duration: number;
  status: InterviewStatus;
  scheduledAt: string; // ISO OffsetDateTime (backend OffsetDateTime → ISO string)
}
