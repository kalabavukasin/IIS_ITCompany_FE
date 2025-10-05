import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = 'http://localhost:8080/api/reports';

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

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
