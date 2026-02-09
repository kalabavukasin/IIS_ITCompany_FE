import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,BehaviorSubject, map, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  activated: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // BASE API URL — prilagodi svom backendu
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private loggedInUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public loggedInUser$ = this.loggedInUserSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('loggedInUser');
      if (userJson) {
        this.loggedInUserSubject.next(JSON.parse(userJson)); // Initialize from localStorage if available
      }
    }
  }

  // -------- AUTH --------
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('loggedInUser', JSON.stringify(response));
        this.loggedInUserSubject.next(response);
      })
    );
  }

  register(formData: FormData): Observable<any> {
    return this.http.post<void>(`${this.apiUrl}/register`, formData);
  }

  // -------- TOKEN STORAGE --------
 /* setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }*/

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getLoggedInUser(): LoginResponse | null {
    return this.loggedInUserSubject.value;
  }

  activateAccount(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activate?token=${token}`);
  }
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUser');
    this.loggedInUserSubject.next(null);
  }
}
