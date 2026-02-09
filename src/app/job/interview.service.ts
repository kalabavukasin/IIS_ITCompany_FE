import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewToShowDTO } from './model/interview-show.model';

@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private readonly api = 'http://localhost:8080/api/interviews';

  constructor(private http: HttpClient) {}

  getByInterviewerId(interviewerId: number): Observable<InterviewToShowDTO[]> {
    const params = new HttpParams().set('interviewerId', String(interviewerId));
    return this.http.get<InterviewToShowDTO[]>(this.api, { params });
  }
  getObservedByUserId(userId: number) {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<InterviewToShowDTO[]>(`${this.api}/observed`, { params });
  }
}