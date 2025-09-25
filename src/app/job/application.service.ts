import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPostingCard, JobPostingDetail } from './model/job-posting.model';

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
}