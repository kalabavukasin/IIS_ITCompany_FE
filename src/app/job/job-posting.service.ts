import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPostingCard, JobPostingDetail } from './model/job-posting.model';

@Injectable({ providedIn: 'root' })
export class JobPostingService {
  private readonly api = 'http://localhost:8080/api/postings/public';
  private readonly mgmtApi = 'http://localhost:8080/api/postings';

  constructor(private http: HttpClient) {}

  listOpen(): Observable<JobPostingCard[]> {
    return this.http.get<JobPostingCard[]>(`${this.api}/open`);
  }

  getDetail(id: number): Observable<JobPostingDetail> {
    return this.http.get<JobPostingDetail>(`${this.api}/${id}`);
  }

  getPosting(id: number): Observable<JobPostingCard> {
    return this.http.get<JobPostingCard>(`${this.mgmtApi}/${id}`);
  }

  archivePosting(id: number): Observable<JobPostingCard> {
    return this.http.post<JobPostingCard>(`${this.mgmtApi}/${id}/archive`, {});
  }

  extendPosting(id: number, newValidTo: string): Observable<JobPostingCard> {
    return this.http.post<JobPostingCard>(`${this.mgmtApi}/${id}/extend`, { newValidTo });
  }

  republishPosting(id: number, newValidTo?: string): Observable<JobPostingCard> {
    return this.http.post<JobPostingCard>(`${this.mgmtApi}/${id}/republish`, { newValidTo: newValidTo ?? null });
  }
}
