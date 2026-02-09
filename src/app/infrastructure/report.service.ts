import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = 'http://localhost:8080/api/reports';
  private readonly plsqlApiUrl = 'http://localhost:8080/api/plsql-reports';

  constructor(private http: HttpClient) { }

  generatePdfReport(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/pdf`, {
      params: params,
      responseType: 'blob'
    });
  }

  generateCurrentMonthPdfReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/current-month`, {
      responseType: 'blob'
    });
  }

  generateCurrentYearPdfReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/current-year`, {
      responseType: 'blob'
    });
  }

  generateLast30DaysPdfReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/last-30-days`, {
      responseType: 'blob'
    });
  }

  // ===== PL/SQL REPORTS (New) =====

  generatePlSqlComprehensiveReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.plsqlApiUrl}/comprehensive`, { params });
  }

  generatePlSqlCurrentMonthReport(): Observable<any> {
    return this.http.get(`${this.plsqlApiUrl}/current-month`);
  }

  generatePlSqlLast30DaysReport(): Observable<any> {
    return this.http.get(`${this.plsqlApiUrl}/last-30-days`);
  }

  getRecruitmentMetrics(startDate: string, endDate: string, jobPostingId?: number): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (jobPostingId) {
      params = params.set('jobPostingId', jobPostingId.toString());
    }

    return this.http.get(`${this.plsqlApiUrl}/metrics`, { params });
  }

  getStagePerformance(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.plsqlApiUrl}/stage-performance`, { params });
  }

  getJobPostingSummary(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.plsqlApiUrl}/job-posting-summary`, { params });
  }

  // ===== UTILITY =====

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  downloadJsonAsFile(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
