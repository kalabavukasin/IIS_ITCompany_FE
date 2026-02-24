import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRequestion, RequestionResponse } from './model/requestion.model';

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private readonly api = 'http://localhost:8080/api/requestions';

  constructor(private http: HttpClient) {}

  create(payload: CreateRequestion): Observable<RequestionResponse> {
    return this.http.post<RequestionResponse>(this.api, payload);
  }

  list(): Observable<RequestionResponse[]> {
    return this.http.get<RequestionResponse[]>(this.api);
  }

  listMine(): Observable<RequestionResponse[]> {
    return this.http.get<RequestionResponse[]>(`${this.api}/mine`);
  }

  listToApprove(): Observable<RequestionResponse[]> {
    return this.http.get<RequestionResponse[]>(`${this.api}/to-approve`);
  }

  getById(id: number): Observable<RequestionResponse> {
    return this.http.get<RequestionResponse>(`${this.api}/${id}`);
  }

  approve(id: number, comment: string, durationDays?: number | null): Observable<RequestionResponse> {
    return this.http.post<RequestionResponse>(`${this.api}/${id}/approve`, { comment, durationDays });
  }

  reject(id: number, comment: string): Observable<RequestionResponse> {
    return this.http.post<RequestionResponse>(`${this.api}/${id}/reject`, { comment });
  }
}
