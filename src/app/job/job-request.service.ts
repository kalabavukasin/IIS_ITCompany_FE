import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRequestion, RequestionResponse } from './model/requestion.model';

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private readonly api = 'http://localhost:8080/api/requestions';

  constructor(private http: HttpClient) {}

  create(payload: CreateRequestion, userId : number): Observable<RequestionResponse> {
    const url = `${this.api}?userId=${userId}`;
    return this.http.post<RequestionResponse>(url, payload);
  }

  list(): Observable<RequestionResponse[]> {
    return this.http.get<RequestionResponse[]>(this.api);
  }
  listMine(userId: number): Observable<RequestionResponse[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RequestionResponse[]>(`${this.api}/mine`, { params });
  }

  listToApprove(userId: number): Observable<RequestionResponse[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RequestionResponse[]>(`${this.api}/to-approve`, { params });
  }
  getById(id: number): Observable<RequestionResponse> {
    return this.http.get<RequestionResponse>(`${this.api}/${id}`);
  }

  approve(id: number, userId: number, comment: string): Observable<RequestionResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<RequestionResponse>(`${this.api}/${id}/approve`, { comment }, { params });
  }

  reject(id: number, userId: number, comment: string): Observable<RequestionResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<RequestionResponse>(`${this.api}/${id}/reject`, { comment }, { params });
  }
}