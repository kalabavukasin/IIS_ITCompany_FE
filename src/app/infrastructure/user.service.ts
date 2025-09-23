import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO { id: number; firstName: string; lastName: string; email: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = 'http://localhost:8080/api/users';
  constructor(private http: HttpClient) {}
  getById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.api}/${id}`);
  }
}