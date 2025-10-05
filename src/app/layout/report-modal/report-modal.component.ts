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
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;

  constructor(private reportService: ReportService) {}

  onCloseModal(): void {
    this.closeModal.emit();
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
