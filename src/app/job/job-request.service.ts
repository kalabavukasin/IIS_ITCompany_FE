import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRequestion, RequestionResponse } from './model/requestion.model';

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private readonly api = 'http://localhost:8080/api/requestions';

  constructor(private http: HttpClient) {}

  create(payload: CreateRequestion): Observable<RequestionResponse> {
    const token = localStorage.getItem('authToken'); // postavlja se u postojećem AuthService.login() :contentReference[oaicite:3]{index=3}
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<RequestionResponse>(this.api, payload, { headers });
  }

  list(): Observable<RequestionResponse[]> {
    return this.http.get<RequestionResponse[]>(this.api);
  }
}