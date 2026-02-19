import { Component } from '@angular/core';
import { ApplicationDetailsDto, ApplicationService } from '../application.service';
import { ActivatedRoute } from '@angular/router';
import { InterviewDetailsDto, TestDetailsDto } from '../model/requestion.model';

@Component({
  selector: 'app-application-view',
  templateUrl: './application-view.component.html',
  styleUrls: ['./application-view.component.css']
})
export class ApplicationViewComponent {
  loading = false;
  error: string | null = null;
  data: ApplicationDetailsDto | null = null;
  showJobDetails = false;

  testLoading = false;
  testError: string | null = null;
  test: TestDetailsDto | null = null;

  interviewLoading = false;
  interviewError: string | null = null;
  interview: InterviewDetailsDto | null = null;
  solutionFile: File | null = null;
  testFileError = '';
  newTestFile: File | null = null;
  newTestFileError = '';

  constructor(
    private route: ActivatedRoute,
    private appSvc: ApplicationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const applicationId = Number(idParam);
    if (!applicationId) {
      this.error = 'Invalid application id.';
      return;
    }
    this.load(applicationId);
  }

  private load(applicationId: number) {
    this.loading = true;
    this.error = null;
    this.appSvc.getDetails(applicationId).subscribe({
      next: (dto) => {
        this.data = dto;
        this.loading = false;
        this.loadTest(applicationId)
        this.loadInterview(applicationId);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load application details.';
        this.loading = false;
      }
    });
  }
  private loadTest(applicationId: number) {
    this.testLoading = true;
    this.testError = null;
    this.test = null;

    this.appSvc.getTestDetailsByApplication(applicationId).subscribe({
      next: (t) => {
        this.test = t ?? null;
        this.testLoading = false;
      },
      error: (err) => {
        if (err?.status === 204 || err?.status === 404) {
          this.test = null;
          this.testLoading = false;
          return;
        }
        this.testError = err?.error?.message || 'Failed to load test details.';
        this.testLoading = false;
      }
    });
  }
   private loadInterview(applicationId: number) {
    this.interviewLoading = true;
    this.interviewError = null;
    this.interview = null;

    this.appSvc.getInterviewDetailsByApplication(applicationId).subscribe({
      next: (iv) => {
        this.interview = iv ?? null;
        this.interviewLoading = false;
      },
      error: (err) => {
        if (err?.status === 204 || err?.status === 404) {
          this.interview = null;
          this.interviewLoading = false;
          return;
        }
        this.interviewError = err?.error?.message || 'Failed to load interview details.';
        this.interviewLoading = false;
      }
    });
  }
  canOpenTestLink(): boolean {
    if (!this.test) return false;
    const deadlineMs = this.test.deadline ? new Date(this.test.deadline).getTime() : 0;
    return this.test.inviteStatus === 'SENT' && deadlineMs > Date.now() ;
  }
  canUploadTest(): boolean {
    return this.canOpenTestLink();
  }
  onSolutionSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;

    this.newTestFileError = '';
    if (f) {
      const okType =
        /(pdf|msword|officedocument|zip|rar|7z)/i.test(f.type) ||
        /\.(pdf|docx?|odt|zip|rar|7z)$/i.test(f.name);
      const okSize = f.size <= 10 * 1024 * 1024; // 10MB

      if (!okType) { this.newTestFileError = 'Unsupported file type.'; this.newTestFile = null; return; }
      if (!okSize) { this.newTestFileError = 'File too large (max 10MB).'; this.newTestFile = null; return; }
    }
    this.newTestFile = f;
  }

  replaceTestFile() {
    if (!this.test?.id || !this.newTestFile || this.newTestFileError) return;

    this.appSvc.updateTestFile(this.test.id, this.newTestFile).subscribe({
      next: _ => {
        // nakon uspeha – osveži test detalje da bi link/status bili ažurirani
        if (this.data?.applicationId) {
          this.loadTest(this.data.applicationId);
        }
        this.newTestFile = null;
        this.newTestFileError = '';
        console.log('Test file replaced successfully.');
      },
      error: err => {
        console.error('Failed to replace test file', err);
        this.newTestFileError = err?.error?.message || 'Failed to replace test file.';
      }
    });
  }




  salaryFormatted(): string {
    if (!this.data?.salary && this.data?.salary !== 0) return '—';
    return new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format(this.data!.salary as number);
  }
  fmt(v: any, fallback = '—') {
    return (v === null || v === undefined || v === '') ? fallback : v;
  }

}
