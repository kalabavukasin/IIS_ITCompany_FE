import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkflowSummary } from './model/requestion.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly api = 'http://localhost:8080/api/workflows/summaries';
  constructor(private http: HttpClient) {}
  list(): Observable<WorkflowSummary[]> {
    return this.http.get<WorkflowSummary[]>(this.api);
  }
}