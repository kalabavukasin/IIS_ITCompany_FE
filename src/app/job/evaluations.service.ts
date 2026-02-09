import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateEvaluationRequest {
  interviewId: number;
  interviewerId: number;
  grade: string;
  comment: string;
}

export interface EvaluationResponse {
  id: number;
  interviewId: number;
  interviewerId: number;
  grade: string;
  comment: string;
  createdAt: string;
}
@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  private readonly api = 'http://localhost:8080/api/evaluations';

  constructor(private http: HttpClient) {}

  create(body: CreateEvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.api, body);
  }

  get(interviewId: number, interviewerId: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.api}`, {
      params: { interviewId, interviewerId } as any
    });
  }
}