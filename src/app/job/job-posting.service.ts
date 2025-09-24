import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPostingCard, JobPostingDetail } from './model/job-posting.model';

@Injectable({ providedIn: 'root' })
export class JobPostingService {
  private readonly api = 'http://localhost:8080/api/postings/public';

  constructor(private http: HttpClient) {}

  listOpen(): Observable<JobPostingCard[]> {
    return this.http.get<JobPostingCard[]>(`${this.api}/open`);
  }
  getDetail(id: number, candidateId?: number): Observable<JobPostingDetail> {
    let params = new HttpParams();
    if (candidateId != null) params = params.set('candidateId', String(candidateId));
    return this.http.get<JobPostingDetail>(`${this.api}/${id}`, { params });
  }
}