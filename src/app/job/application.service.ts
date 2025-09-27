import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
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

  candidateId: number;
  candidateName: string;
  openUntil?: string;
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
}
export interface TestRefuseDTO {
  score: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient) {}

  apply(postingId: number, candidateId: number): Observable<any> {
    const params = new HttpParams()
      .set('postingId', String(postingId))
      .set('candidateId', String(candidateId));

    return this.http.post<any>(`${this.api}/apply`, null, {
      params
    });
  }
  getAllApplicationCards() {
    return this.http.get<ApplicationWithUserDTO[]>(
      `${this.api}/cards`
    );
  }
  getDetails(id: number) {
  return this.http.get<ApplicationDetailsDto>(`${this.api}/${id}/details`);
  }
  //advance(id: number) {
 //   return this.http.post<void>(`${this.api}/${id}/advance`, {});
 // }
  refuse(id: number, reason: string) {
    return this.http.post<any>(`${this.api}/${id}/refuse`, {reason});
  }
  sendTestInvite(appId: number, type: string, activeUntilIso: string, triggeredBy: number, file: File) {
    const form = new FormData();
    const data = { applicationId: appId, type, activeUntil: activeUntilIso, triggeredById : triggeredBy }; // ISO string (OffsetDateTime)
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    form.append('file', file, file.name);
    return this.http.post<any>('http://localhost:8080/api/tests/invite', form);
  }
  scheduleInterview(dto: InterviewScheduleDTO, scheduledById: number) {
    return this.http.post<any>(`http://localhost:8080/api/interviews/${scheduledById}/schedule`, dto);
  }
  makeOffer(dto: OfferCreateDTO, triggeredById: number) {
    return this.http.post<void>(`http://localhost:8080/api/applications/${triggeredById}/offer`, dto);
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
  }