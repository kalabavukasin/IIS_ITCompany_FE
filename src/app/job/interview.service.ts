import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewToShowDTO } from './model/interview-show.model';

@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private readonly api = 'http://localhost:8080/api/interviews';

  constructor(private http: HttpClient) {}

  getMine(): Observable<InterviewToShowDTO[]> {
    return this.http.get<InterviewToShowDTO[]>(this.api);
  }

  getObserved(): Observable<InterviewToShowDTO[]> {
    return this.http.get<InterviewToShowDTO[]>(`${this.api}/observed`);
  }
}
