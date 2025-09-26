import { Component } from '@angular/core';
import { ApplicationDetailsDto, ApplicationService } from '../application.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.css']
})
export class ApplicationDetailsComponent {

  data?: ApplicationDetailsDto;
  loading = true;
  error: string | null = null;

  refuseOpen = false;
  refuseReason = '';
  refuseTouched = false;

  testUploadOpen = false;
  testFile: File | null = null;
  testFileError = '';
  testActiveUntil = ''; // datetime-local string

  testRefuseOpen = false;
  testScoreRefuse: number | null = null;
  testScoreRefuseTouched = false;

  interviewOpen = false;
  testScoreProceed: number | null = null;
  interviewDateTime = '';
  interviewLocation = '';
  interviewType: 'ONSITE' | 'ONLINE' | 'PHONE' = 'ONSITE';
  interviewDuration: number | null = null;
  testType: string = '';

  offerOpen = false;
  offerStartDate = '';
  minDateTime: string = '';

  flowCompleted = false;
  userId: number | null = null;

  constructor(private route: ActivatedRoute, private svc: ApplicationService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const u = this.auth.getLoggedInUser();
    if (!u || (u.role !== 'HR_MANAGER' && u.role !== 'HIRING_MANAGER')) { this.router.navigate(['']); return; }
    this.userId = u.id;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getDetails(id).subscribe({
      next: d => { this.data = d; this.loading = false; /*console.log(d);*/ },
      error: _ => { this.error = 'Failed to load details.'; this.loading = false; }
    });
    this.minDateTime = this.getNowDateTimeLocal();
  }
  private getNowDateTimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }

  downloadCv() {
    if (this.data?.cvDownloadUrl) {
      window.location.href = this.data.cvDownloadUrl;
    }
  }

  advance() {
    console.log("advance");
  }

  refuse() {
    console.log("refuse");
  }
  getNextPhase(): string | null {
    if (!this.data || !this.data.phases?.length) return null;

    if (!this.data.currentPhase) return this.data.phases[0] ?? null;

    const idx = this.data.phases.indexOf(this.data.currentPhase);
    if (idx === -1) return this.data.phases[0] ?? null;

    return this.data.phases[idx + 1] ?? null;
  }
  onProceedClicked() {
    if (!this.data) return;
    const next = this.getNextPhase();
    if (!next) {
      console.log('Nema sledeće faze (kraj toka).');
      return;
    }

    switch (next) {
      case 'Test':
        this.openTestUpload();        // modal 1
        break;
      case 'Intervju':
        this.openInterview();         // modal 3
        break;
      case 'Ponuda':
        this.openOffer();             // modal 4
        break;
      default:
        // ako imate druge faze, dodajte grananje ovde
        console.log('Nepodržana sledeća faza:', next);
        break;
    }
  }
  onRefuseClicked() {
    if (!this.data) return;
    if (this.data.currentPhase === 'Test') {
      this.openTestRefuse();
    } else {
      this.openRefuseModal();
    }
  }
  openRefuseModal() { this.refuseOpen = true; this.refuseTouched = false; }
  cancelRefuse() { this.refuseOpen = false; this.refuseReason = ''; this.refuseTouched = false; }
  confirmRefuse() {
    this.refuseTouched = true;
    if (!this.refuseReason.trim() || !this.data) return;
    //console.log('REFUSE (general):', { appId: this.data.applicationId, reason: this.refuseReason });
    this.svc.refuse(this.data.applicationId, this.refuseReason).subscribe({
      next: (result) => {
        this.refuseOpen = false;
        //console.log(result);
         if (this.data) {
          this.data.applicationStatus = 'REFUSED';
        }
      },
      error: err => { console.error(err); /* prikaži poruku po želji */ }
    });
    this.refuseOpen = false;
  }
  // ====== 1) Preselekcija -> Test (upload testa) ======
  openTestUpload() { this.testUploadOpen = true; this.testFileError = ''; }
  cancelTestUpload() { this.testUploadOpen = false; this.testFile = null; this.testActiveUntil = ''; this.testFileError=''; }
  onTestFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.testFileError = '';
    if (f) {
      const okType = /(pdf|msword|officedocument|zip|rar|7z)/i.test(f.type) || /\.(pdf|docx?|odt|zip|rar|7z)$/i.test(f.name);
      const okSize = f.size <= 10 * 1024 * 1024; // 10MB
      if (!okType) { this.testFileError = 'Unsupported file type.'; this.testFile = null; return; }
      if (!okSize) { this.testFileError = 'File too large (max 10MB).'; this.testFile = null; return; }
    }
    this.testFile = f;
  }
  confirmProceedToTest() {
    if (!this.data || !this.testFile || !this.testActiveUntil || !this.testType) return;
    console.log('PROCEED -> TEST:', {
      appId: this.data.applicationId,
      fileName: this.testFile.name,
      activeUntil: this.testActiveUntil,
      type: this.testType
    });
    if(this.userId != null){
      this.svc.sendTestInvite(
      this.data.applicationId,
      this.testType,
      new Date(this.testActiveUntil).toISOString(),
      this.userId,
      this.testFile
    ).subscribe({
      next: _ => { this.testUploadOpen = false; this.reloadDetails()},
      error: err => { this.testFileError = 'Greška pri slanju testa.'; console.error(err); }
    });
    }
    this.testUploadOpen = false;
  }
  // ====== 2) Refuse iz TEST faze ======
  openTestRefuse() { this.testRefuseOpen = true; this.testScoreRefuseTouched = false; }
  cancelTestRefuse() { this.testRefuseOpen = false; this.testScoreRefuse = null; this.testScoreRefuseTouched = false; }
  confirmRefuseFromTest() {
    if (!this.data || this.testScoreRefuse === null || this.testScoreRefuse === undefined) return;
    //console.log('REFUSE from TEST:', { appId: this.data.applicationId, score: this.testScoreRefuse });
    this.svc.refuse(this.data.applicationId, this.refuseReason).subscribe({
      next: (result) => {
        this.refuseOpen = false;
        //console.log(result);
         if (this.data) {
          this.data.applicationStatus = 'REFUSED';
        }
      },
      error: err => { console.error(err); /* prikaži poruku po želji */ }
    });
    this.testRefuseOpen = false;
  }

  // ====== 3) Test -> Intervju ======
  openInterview() { this.interviewOpen = true; }
  cancelInterview() {
    this.interviewOpen = false;
    this.testScoreProceed = null;
    this.interviewDateTime = '';
    this.interviewLocation = '';
    this.interviewType = 'ONSITE';
    this.interviewDuration = null;
  }
  isInterviewFormValid(): boolean {
    return this.testScoreProceed !== null && !!this.interviewDateTime && !!this.interviewLocation && !!this.interviewDuration;
  }
  confirmProceedToInterview() {
    if (!this.data || !this.isInterviewFormValid()) return;
    console.log('PROCEED -> INTERVIEW:', {
      appId: this.data.applicationId,
      score: this.testScoreProceed,
      dateTime: this.interviewDateTime,
      location: this.interviewLocation,
      type: this.interviewType,
      durationMin: this.interviewDuration
    });
    this.interviewOpen = false;
    // this.data.currentPhase = 'Intervju';
  }
  openOffer() { this.offerOpen = true; }
  cancelOffer() { this.offerOpen = false; this.offerStartDate = ''; }
  confirmMakeOffer() {
    if (!this.data || !this.offerStartDate) return;
    console.log('MAKE OFFER:', { appId: this.data.applicationId, startDate: this.offerStartDate });
    this.offerOpen = false;
    this.flowCompleted = true; // sakrij dugmad i označi final
    // this.data.currentPhase = 'Ponuda';
  }
  private reloadDetails() {
  if (!this.data) return;
  
  this.loading = true;
  this.svc.getDetails(this.data.applicationId).subscribe({
    next: d => { 
      this.data = d; 
      this.loading = false;  
    },
    error: _ => { 
      this.error = 'Failed to reload details.'; 
      this.loading = false; 
    }
  });
}

}
