import { Component } from '@angular/core';
import { ApplicationDetailsDto, ApplicationService, InterviewScheduleDTO } from '../application.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { StaffMemberDTO, UserService } from 'src/app/infrastructure/user.service';

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
  testRefuseReason: string | null = null;
  testRefuseReasonTouched = false;

  interviewOpen = false;
  testScoreProceed: number | null = null;
  interviewDateTime = '';
  interviewLocation = '';
  interviewType: 'HR_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'MANAGERIAL' | 'FINAL' = 'HR_SCREEN';
  interviewDuration: number | null = null;
  testType: string = '';

  offerOpen = false;
  offerStartDate = '';
  minDateTime: string = '';
  minDate: string = '';

  flowCompleted = false;
  userId: number | null = null;

  staff: StaffMemberDTO[] = [];
  staffInterviewers: StaffMemberDTO[] = [];
  staffObservers: StaffMemberDTO[] = [];
  interviewerId: number | null = null;
  observerIds: number[] = [];
  observerIdsSet = new Set<number>();

  constructor(private route: ActivatedRoute, private svc: ApplicationService, private auth: AuthService, private router: Router,
    private users: UserService
  ) {}

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
    this.minDate = this.getTodayDateLocal();
  }
  isObserverSelected(id: number): boolean {
    return this.observerIdsSet.has(id);
  }
  toggleObserver(id: number, checked: boolean) {
    if (checked) this.observerIdsSet.add(id);
    else this.observerIdsSet.delete(id);
  }
  onObserverChange(id: number, ev: Event) {
    const checked = (ev.target as HTMLInputElement)?.checked ?? false;
    this.toggleObserver(id, checked);
  }
  private getNowDateTimeLocal(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }
  private getTodayDateLocal(): string {
    const now = new Date();
    // normalizuj na lokalni dan
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10); // yyyy-MM-dd
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
  openRefuseModal() {
    if (this.isFromTest()) {            // već koristiš isFromTest() u HTML-u intervjua
    this.testRefuseOpen = true;
    this.testScoreRefuse = null;
    this.testScoreRefuseTouched = false;
    this.testRefuseReason = '';
    this.testRefuseReasonTouched = false;
    } else {
      this.refuseOpen = true;           // postojeći generalni modal za preselekciju/intervju
      this.refuseReason = '';
      this.refuseTouched = false;
    }
  }
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
    this.testScoreRefuseTouched = true;
    this.testRefuseReasonTouched = true;

    if (this.testScoreRefuse === null || this.testScoreRefuse === undefined || !this.testRefuseReason?.trim()) {
      return;
    }

    const dto = {
      score: this.testScoreRefuse,
      reason: this.testRefuseReason.trim()
    };

    if(this.data){
      this.loading = true;
      this.svc.refuseAfterTest(dto,this.data.applicationId).subscribe({
        next: () => {
          this.loading = false;
          this.testRefuseOpen = false;

          this.reloadDetails();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Error while refusing after test.';
        }
      });
    }
  }

  // ====== 3) Test -> Intervju ======
  openInterview() { 
    this.interviewOpen = true;
    this.users.getStaffMembers().subscribe({
      next: (list) => {
        this.staff = list ?? [];
        this.staffInterviewers = this.staff.filter(m => m.role === 'INTERVIEWER');
        this.staffObservers = this.staff.filter(m => m.role === 'HR_MANAGER' || m.role === 'HIRING_MANAGER');
      },
      error: (err) => { console.error('Failed to load staff', err); this.staffInterviewers = []; this.staffObservers = []; }
    });
  }
  cancelInterview() {
    this.interviewOpen = false;
    this.testScoreProceed = null;
    this.interviewDateTime = '';
    this.interviewLocation = '';
    this.interviewType = 'HR_SCREEN';
    this.interviewDuration = null;
    this.interviewerId = null;
    this.observerIdsSet.clear();
  }
  isFromTest(): boolean {
    return this.data?.currentPhase === 'Test';
  }

  isInterviewFormValid(): boolean {
    const baseValid =
    !!this.interviewDateTime &&
    !!this.interviewLocation &&
    !!this.interviewType &&
    !!this.interviewDuration &&
    this.interviewerId !== null;

  // testScoreProceed je potreban samo ako prelazimo iz Test faze
    if (this.isFromTest()) {
      return baseValid && this.testScoreProceed !== null && this.testScoreProceed !== undefined;
    }
    return baseValid;
  }
  private toIsoWithOffset(localDatetime: string): string {
    // 'datetime-local' => konstruiši Date kao lokalni pa pretvori u ISO
    const d = new Date(localDatetime);
    return d.toISOString();
  }
  confirmProceedToInterview() {
    if (!this.data || !this.isInterviewFormValid() || this.interviewerId === null) return;
    const dto: InterviewScheduleDTO = {
      applicationId: this.data.applicationId,
      scheduledAt: this.toIsoWithOffset(this.interviewDateTime),
      location: this.interviewLocation,
      interviewType: this.interviewType,
      durationMinutes: this.interviewDuration!,         // već validirano
      interviewerId: this.interviewerId,
      observerIds: this.observerIdsSet.size ? Array.from(this.observerIdsSet) : undefined
    };

    if (this.isFromTest() && this.testScoreProceed !== null && this.testScoreProceed !== undefined) {
      dto.testScore = this.testScoreProceed;
    }
    if(this.userId)
    this.svc.scheduleInterview(dto,this.userId).subscribe({
      next: _ => {
        this.interviewOpen = false;
        this.reloadDetails();
      },
      error: err => { console.error(err); }
    });
    // this.data.currentPhase = 'Intervju';
  }
  openOffer() { this.offerOpen = true; }
  cancelOffer() { this.offerOpen = false; this.offerStartDate = ''; }
  confirmMakeOffer() {
    if (!this.data || !this.offerStartDate) return;
    //console.log('MAKE OFFER:', { appId: this.data.applicationId, startDate: this.offerStartDate });
    const dto = {
    applicationId: this.data.applicationId,
    startDate: this.offerStartDate
    };
    if(this.userId)
    this.svc.makeOffer(dto, this.userId).subscribe({
      next: _ => {
        this.offerOpen = false;
        this.flowCompleted = true;
        this.reloadDetails();
      },
      error: err => {
        console.error(err);
        // po želji: pokaži poruku greške u UI
      }
    });
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
