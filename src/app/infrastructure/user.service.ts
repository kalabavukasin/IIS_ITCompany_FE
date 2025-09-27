import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO { id: number; firstName: string; lastName: string; email: string; }
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}
export interface ApplicationCardDTO {
  applicationId: number;
  status: string;
  jobPostingId: number;
  requestName: string;
  requestDescription: string;
}
export interface StaffMemberDTO {
  id: number;
  fullName: string;
  role: string; // HR_MANAGER | HIRING_MANAGER | INTERVIEWER
}

export interface PhoneUpdate { phone: string; }
export interface ChangePassword { oldPassword: string; newPassword: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = 'http://localhost:8080/api/users';
  constructor(private http: HttpClient) {}
  getById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.api}/${id}`);
  }
  updatePhone(id: number, phone: string): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.api}/${id}/phone`, { phone } as PhoneUpdate);
  }

  changePassword(id: number, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/password`, { oldPassword, newPassword } as ChangePassword);
  }
  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/${id}`);
  }
  
  myApplicationCards(candidateId: number) {
    return this.http.get<ApplicationCardDTO[]>(
      `http://localhost:8080/api/applications/${candidateId}/cards`
    );
  }
  getStaffMembers(): Observable<StaffMemberDTO[]> {
    return this.http.get<StaffMemberDTO[]>(`${this.api}/staff`);
  }

}
