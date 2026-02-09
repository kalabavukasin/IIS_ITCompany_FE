import { Component, EventEmitter, Output } from '@angular/core';
import { ReportService } from 'src/app/infrastructure/report.service';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  selectedReportType: string = 'custom';
  selectedReportFormat: string = 'pdf'; // 'pdf' ili 'plsql'
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  plsqlReportData: any = null;
  showPlsqlResults: boolean = false;

  constructor(private reportService: ReportService) {}

  onCloseModal(): void {
    this.closeModal.emit();
    this.plsqlReportData = null;
    this.showPlsqlResults = false;
  }

  onGenerateReport(): void {
    if (this.selectedReportType === 'custom' && (!this.startDate || !this.endDate)) {
      alert('Molimo unesite početni i krajnji datum za prilagođeni izveštaj.');
      return;
    }

    if (this.selectedReportType === 'custom' && new Date(this.startDate) > new Date(this.endDate)) {
      alert('Početni datum ne može biti nakon krajnjeg datuma.');
      return;
    }

    this.isLoading = true;

    // PL/SQL Izveštaji
    if (this.selectedReportFormat === 'plsql') {
      this.generatePlSqlReport();
      return;
    }

    // PDF Izveštaji
    switch (this.selectedReportType) {
      case 'custom':
        this.reportService.generatePdfReport(this.startDate, this.endDate).subscribe({
          next: (blob) => {
            const filename = `izvestaj_${this.startDate}_do_${this.endDate}.pdf`;
            this.reportService.downloadFile(blob, filename);
            this.isLoading = false;
            this.onCloseModal();
          },
          error: (error) => {
            console.error('Greška pri generisanju izveštaja:', error);
            alert('Greška pri generisanju izveštaja. Molimo pokušajte ponovo.');
            this.isLoading = false;
          }
        });
        break;

      case 'current-month':
        this.reportService.generateCurrentMonthPdfReport().subscribe({
          next: (blob) => {
            const currentDate = new Date();
            const filename = `izvestaj_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}.pdf`;
            this.reportService.downloadFile(blob, filename);
            this.isLoading = false;
            this.onCloseModal();
          },
          error: (error) => {
            console.error('Greška pri generisanju mesečnog izveštaja:', error);
            alert('Greška pri generisanju mesečnog izveštaja. Molimo pokušajte ponovo.');
            this.isLoading = false;
          }
        });
        break;

      case 'current-year':
        this.reportService.generateCurrentYearPdfReport().subscribe({
          next: (blob) => {
            const currentYear = new Date().getFullYear();
            const filename = `izvestaj_${currentYear}.pdf`;
            this.reportService.downloadFile(blob, filename);
            this.isLoading = false;
            this.onCloseModal();
          },
          error: (error) => {
            console.error('Greška pri generisanju godišnjeg izveštaja:', error);
            alert('Greška pri generisanju godišnjeg izveštaja. Molimo pokušajte ponovo.');
            this.isLoading = false;
          }
        });
        break;

      case 'last-30-days':
        this.reportService.generateLast30DaysPdfReport().subscribe({
          next: (blob) => {
            const filename = 'izvestaj_poslednjih_30_dana.pdf';
            this.reportService.downloadFile(blob, filename);
            this.isLoading = false;
            this.onCloseModal();
          },
          error: (error) => {
            console.error('Greška pri generisanju izveštaja za poslednjih 30 dana:', error);
            alert('Greška pri generisanju izveštaja za poslednjih 30 dana. Molimo pokušajte ponovo.');
            this.isLoading = false;
          }
        });
        break;
    }
  }

  generatePlSqlReport(): void {
    switch (this.selectedReportType) {
      case 'custom':
        this.reportService.generatePlSqlComprehensiveReport(this.startDate, this.endDate).subscribe({
          next: (data) => {
            this.plsqlReportData = this.formatPlSqlData(data);
            this.showPlsqlResults = true;
            this.isLoading = false;
            console.log('PL/SQL Report Data:', data);
          },
          error: (error) => {
            console.error('Greška pri generisanju PL/SQL izveštaja:', error);
            alert('Greška pri generisanju PL/SQL izveštaja. Proverite da li su PL/SQL funkcije pokrenute u bazi.');
            this.isLoading = false;
          }
        });
        break;

      case 'current-month':
        this.reportService.generatePlSqlCurrentMonthReport().subscribe({
          next: (data) => {
            this.plsqlReportData = this.formatPlSqlData(data);
            this.showPlsqlResults = true;
            this.isLoading = false;
            console.log('PL/SQL Current Month Report:', data);
          },
          error: (error) => {
            console.error('Greška pri generisanju PL/SQL mesečnog izveštaja:', error);
            alert('Greška pri generisanju PL/SQL mesečnog izveštaja.');
            this.isLoading = false;
          }
        });
        break;

      case 'last-30-days':
        this.reportService.generatePlSqlLast30DaysReport().subscribe({
          next: (data) => {
            this.plsqlReportData = this.formatPlSqlData(data);
            this.showPlsqlResults = true;
            this.isLoading = false;
            console.log('PL/SQL Last 30 Days Report:', data);
          },
          error: (error) => {
            console.error('Greška pri generisanju PL/SQL izveštaja za 30 dana:', error);
            alert('Greška pri generisanju PL/SQL izveštaja za 30 dana.');
            this.isLoading = false;
          }
        });
        break;

      case 'current-year':
        // Za godišnji izveštaj koristimo prilagođeni sa datumima
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        this.reportService.generatePlSqlComprehensiveReport(startOfYear, today).subscribe({
          next: (data) => {
            this.plsqlReportData = this.formatPlSqlData(data);
            this.showPlsqlResults = true;
            this.isLoading = false;
            console.log('PL/SQL Yearly Report:', data);
          },
          error: (error) => {
            console.error('Greška pri generisanju PL/SQL godišnjeg izveštaja:', error);
            alert('Greška pri generisanju PL/SQL godišnjeg izveštaja.');
            this.isLoading = false;
          }
        });
        break;
    }
  }

  formatPlSqlData(data: any[]): any {
    // Grupisanje podataka po sekcijama
    const sections: any = {
      basicMetrics: [],
      stageAnalysis: [],
      jobPostingAnalysis: [],
      problemDetection: [],
      stagePerformance: [],
      summary: []
    };

    data.forEach(item => {
      switch (item.reportSection) {
        case 'BASIC_METRICS':
          sections.basicMetrics.push(item);
          break;
        case 'STAGE_ANALYSIS':
          sections.stageAnalysis.push(item);
          break;
        case 'JOB_POSTING_ANALYSIS':
          sections.jobPostingAnalysis.push(item);
          break;
        case 'PROBLEM_DETECTION':
          sections.problemDetection.push(item);
          break;
        case 'STAGE_PERFORMANCE':
          sections.stagePerformance.push(item);
          break;
        case 'QUICK_INSIGHTS':
          sections.summary.push(item);
          break;
        case 'SUMMARY':
          sections.summary.push(item);
          break;
      }
    });

    return sections;
  }

  downloadPlSqlAsJson(): void {
    if (this.plsqlReportData) {
      const filename = `plsql_izvestaj_${new Date().toISOString().split('T')[0]}.json`;
      this.reportService.downloadJsonAsFile(this.plsqlReportData, filename);
    }
  }

  closePlSqlResults(): void {
    this.showPlsqlResults = false;
    this.plsqlReportData = null;
  }

  onReportTypeChange(): void {
    // Reset dates when changing report type
    this.startDate = '';
    this.endDate = '';
  }

  getReportTypeDescription(): string {
    switch (this.selectedReportType) {
      case 'current-month':
        return 'tekući mesec';
      case 'current-year':
        return 'tekuću godinu';
      case 'last-30-days':
        return 'poslednjih 30 dana';
      default:
        return '';
    }
  }
}
