import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPostingCard, JobPostingDetail } from './model/job-posting.model';
import { InterviewDetailsDto, TestDetailsDto } from './model/requestion.model';

export interface ApplicationWithUserDTO {
  applicationId: number;
  status: string;
  currentPhase?: string;

  jobPostingId: number;
  requestName: string;
  requestDescription: string;
  requestLocation?: string;
  seniority?: string;

  candidateId: number;
  candidateName: string;
  openUntil?: string;
  cvDownloadUrl?: string;
}
export interface PostingApplicantDTO {
  applicationId: number;
  status: string;
  currentPhase?: string;
  phases?: string[];

  candidateId: number;
  candidateName: string;
  cvDownloadUrl?: string;

  autoAiScore?: number | null;
  autoAiScoreNote?: string | null;
  autoAiScoredAt?: string | null;
  bulkAiScore?: number | null;
  bulkAiScoreNote?: string | null;
  bulkAiScoredAt?: string | null;
}

export interface BulkTestScoreEntry {
  applicationId: number;
  score: number;
}

export interface BulkInterviewScheduleDTO {
  applicationIds: number[];
  interviewType: string;
  location: string;
  durationMinutes: number;
  firstScheduledAt: string;
  breakMinutes: number;
  interviewerId: number;
  observerIds?: number[];
  testScores?: BulkTestScoreEntry[];
}

export interface ApplicationDetailsDto {
  applicationId: number;
  applicationStatus: string;
  appliedAt?: string;

  jobPostingId: number;
  requestName: string;
  requestDescription: string;
  requestLocation?: string;
  seniority?: string;
  salary?: number;
  technologies?: string;
  createdBy?: string;
  openUntil?: string;

  candidateId: number;
  candidateFullName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  cvDownloadUrl?: string;

  currentPhase?: string;
  phases: string[];
  comment?: string;
}
export interface InterviewScheduleDTO {
  applicationId: number;
  testScore?: number;
  scheduledAt: string;
  location: string;
  interviewType: 'HR_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'MANAGERIAL' | 'FINAL';
  durationMinutes: number;
  interviewerId: number;
  observerIds?: number[];
}
export interface OfferCreateDTO {
  applicationId: number;
  startDate: string;
  testScore?: number;
}
export interface TestRefuseDTO {
  score: number;
  reason: string;
}
export interface EvaluationDetailsDto {
  id: number;
  grade: string;
  comment?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient) {}

  apply(postingId: number): Observable<any> {
    const params = new HttpParams().set('postingId', String(postingId));
    return this.http.post<any>(`${this.api}/apply`, null, { params });
  }

  getAllApplicationCards() {
    return this.http.get<ApplicationWithUserDTO[]>(`${this.api}/cards`);
  }

  getMyCreatedCards() {
    return this.http.get<ApplicationWithUserDTO[]>(`${this.api}/cards/my-created`);
  }

  getMyManagedCards() {
    return this.http.get<ApplicationWithUserDTO[]>(`${this.api}/cards/my-managed`);
  }

  getCardsByPosting(postingId: number) {
    return this.http.get<PostingApplicantDTO[]>(`${this.api}/cards/by-posting/${postingId}`);
  }

  getDetails(id: number) {
    return this.http.get<ApplicationDetailsDto>(`${this.api}/${id}/details`);
  }

  refuse(id: number, reason: string) {
    return this.http.post<any>(`${this.api}/${id}/refuse`, { reason });
  }

  sendTestInvite(appId: number, type: string, activeUntilIso: string, file: File) {
    const form = new FormData();
    const data = { applicationId: appId, type, activeUntil: activeUntilIso };
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    form.append('file', file, file.name);
    return this.http.post<any>('http://localhost:8080/api/tests/invite', form);
  }

  scheduleInterview(dto: InterviewScheduleDTO) {
    return this.http.post<any>('http://localhost:8080/api/interviews/schedule', dto);
  }

  makeOffer(dto: OfferCreateDTO) {
    return this.http.post<void>('http://localhost:8080/api/offers', dto);
  }

  refuseAfterTest(dto: TestRefuseDTO, applicationId: number) {
    return this.http.post<void>(`http://localhost:8080/api/tests/${applicationId}/refuse-with-score`, dto);
  }

  getTestDetailsByApplication(applicationId: number) {
    return this.http.get<TestDetailsDto | null>(
      `http://localhost:8080/api/tests/by-application/${applicationId}/details`
    );
  }

  getInterviewDetailsByApplication(applicationId: number) {
    return this.http.get<InterviewDetailsDto | null>(
      `http://localhost:8080/api/interviews/by-application/${applicationId}/details`
    );
  }

  updateTestFile(testInviteId: number, file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.patch<any>(`http://localhost:8080/api/tests/${testInviteId}/file`, form);
  }

  getEvaluationDetailsByApplication(applicationId: number) {
    return this.http.get<EvaluationDetailsDto | null>(
      `http://localhost:8080/api/evaluations/by-application/${applicationId}/details`
    );
  }

  bulkScore(postingId: number) {
    return this.http.post<{ postingId: number; scoredCount: number }>(
      `${this.api}/bulk-score/${postingId}`, null
    );
  }

  bulkRefuse(applicationIds: number[], reason: string) {
    return this.http.post<void>(`${this.api}/bulk-refuse`, { applicationIds, reason });
  }

  bulkRefuseAfterTest(dto: { entries: BulkTestScoreEntry[]; reason: string }) {
    return this.http.post<void>('http://localhost:8080/api/tests/bulk-refuse-with-score', dto);
  }

  bulkSendTest(applicationIds: number[], type: string, activeUntil: string, file: File) {
    const form = new FormData();
    const data = { applicationIds, type, activeUntil };
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    form.append('file', file, file.name);
    return this.http.post<void>('http://localhost:8080/api/tests/bulk-invite', form);
  }

  bulkScheduleInterview(dto: BulkInterviewScheduleDTO) {
    return this.http.post<void>('http://localhost:8080/api/interviews/bulk-schedule', dto);
  }

  bulkMakeOffer(applicationIds: number[], startDate: string, validUntil?: string, testScores?: BulkTestScoreEntry[]) {
    return this.http.post<void>('http://localhost:8080/api/offers/bulk-create', {
      applicationIds, startDate,
      validUntil: validUntil ?? null,
      testScores: testScores ?? null
    });
  }
}
