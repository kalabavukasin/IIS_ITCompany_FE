import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, BulkInterviewScheduleDTO, BulkTestScoreEntry, PostingApplicantDTO } from '../application.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { JobPostingService } from '../job-posting.service';
import { StaffMemberDTO, UserService } from 'src/app/infrastructure/user.service';

@Component({
  selector: 'app-posting-applicants',
  templateUrl: './posting-applicants.component.html',
  styleUrls: ['./posting-applicants.component.css']
})
export class PostingApplicantsComponent implements OnInit {
  items: PostingApplicantDTO[] = [];
  loading = true;
  error = '';
  postingId!: number;

  // Posting info (GET /api/postings/{id})
  postingName = '';
  postingDesc = '';
  postingLocation = '';
  postingOpenUntil: string | undefined;
  postingSeniority: string | undefined;
  postingStatus = '';

  // Filtering & selection
  selectedPhase = 'All';
  showAll = true;
  selectedIds = new Set<number>();

  // Action state (posting mgmt)
  showExtendInput = false;
  showRepublishInput = false;
  extendDate = '';
  republishDate = '';
  actionError = '';
  actionLoading = false;

  // Scoring
  scoreView: 'auto' | 'bulk' = 'auto';
  bulkScoring = false;
  bulkScoreError = '';
  bulkScoreSuccess = '';

  // Staff (for interview modal)
  staffInterviewers: StaffMemberDTO[] = [];
  staffObservers: StaffMemberDTO[] = [];

  // Bulk action shared state
  bulkActionLoading = false;
  bulkActionError = '';
  bulkActionSuccess = '';

  // Bulk refuse modal
  bulkRefuseOpen = false;
  bulkRefuseReason = '';

  // Bulk test modal
  bulkTestOpen = false;
  bulkTestFile: File | null = null;
  bulkTestType = 'CODING';
  bulkTestActiveUntil = '';

  // Bulk interview modal
  bulkInterviewOpen = false;
  bulkInterviewType = 'HR_SCREEN';
  bulkInterviewLocation = '';
  bulkInterviewDuration: number | null = null;
  bulkInterviewFirstAt = '';
  bulkInterviewBreak = 15;
  bulkInterviewerId: number | null = null;
  bulkInterviewObserverIds = new Set<number>();

  // Bulk offer modal
  bulkOfferOpen = false;
  bulkOfferStartDate = '';
  bulkOfferValidUntil = '';

  // Per-candidate test scores (when selectedBulkPhase === 'Test')
  bulkTestScores = new Map<number, number | null>();

  get validToInPast(): boolean {
    if (!this.postingOpenUntil) return true;
    return new Date(this.postingOpenUntil) < new Date(new Date().toDateString());
  }

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  get minDateTime(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ApplicationService,
    private postingSvc: JobPostingService,
    private auth: AuthService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    const u = this.auth.getLoggedInUser();
    if (!u || (u.role !== 'HR_MANAGER' && u.role !== 'HIRING_MANAGER')) {
      this.router.navigate(['']);
      return;
    }
    this.postingId = Number(this.route.snapshot.paramMap.get('id'));

    this.postingSvc.getPosting(this.postingId).subscribe({
      next: (p) => {
        this.postingName = p.name;
        this.postingDesc = p.description;
        this.postingLocation = p.location ?? '';
        this.postingOpenUntil = p.expires;
        this.postingSeniority = p.seniority ?? undefined;
        this.postingStatus = p.status;
      },
      error: () => { this.error = 'Failed to load posting info.'; }
    });

    this.svc.getCardsByPosting(this.postingId).subscribe({
      next: (list) => { this.items = list; this.loading = false; },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load applicants.';
        this.loading = false;
      }
    });

    this.userSvc.getStaffMembers().subscribe({
      next: (list) => {
        this.staffInterviewers = list.filter((m: StaffMemberDTO) => m.role === 'INTERVIEWER');
        this.staffObservers = list.filter((m: StaffMemberDTO) =>
          m.role === 'HR_MANAGER' || m.role === 'HIRING_MANAGER');
      }
    });
  }

  // ===== Posting actions =====

  archive(): void {
    if (!confirm('Archive this job posting? Candidates will no longer be able to apply.')) return;
    this.actionLoading = true;
    this.actionError = '';
    this.postingSvc.archivePosting(this.postingId).subscribe({
      next: (p) => {
        this.postingStatus = p.status;
        this.postingOpenUntil = p.expires;
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err?.error?.message ?? 'Failed to archive posting.';
        this.actionLoading = false;
      }
    });
  }

  extend(): void {
    if (!this.extendDate) return;
    this.actionLoading = true;
    this.actionError = '';
    this.postingSvc.extendPosting(this.postingId, this.extendDate).subscribe({
      next: (p) => {
        this.postingStatus = p.status;
        this.postingOpenUntil = p.expires;
        this.showExtendInput = false;
        this.extendDate = '';
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err?.error?.message ?? 'Failed to extend posting.';
        this.actionLoading = false;
      }
    });
  }

  republish(): void {
    if (this.validToInPast && !this.republishDate) return;
    this.actionLoading = true;
    this.actionError = '';
    this.postingSvc.republishPosting(this.postingId, this.republishDate || undefined).subscribe({
      next: (p) => {
        this.postingStatus = p.status;
        this.postingOpenUntil = p.expires;
        this.showRepublishInput = false;
        this.republishDate = '';
        this.actionLoading = false;
      },
      error: (err) => {
        this.actionError = err?.error?.message ?? 'Failed to republish posting.';
        this.actionLoading = false;
      }
    });
  }

  toggleExtend(): void {
    this.showExtendInput = !this.showExtendInput;
    this.actionError = '';
    this.extendDate = '';
  }

  toggleRepublish(): void {
    this.showRepublishInput = !this.showRepublishInput;
    this.actionError = '';
    this.republishDate = '';
  }

  // ===== Filtering & selection =====

  get uniquePhases(): string[] {
    const phases: string[] = ['All'];
    const seen = new Set<string>();
    for (const item of this.items) {
      const p = item.currentPhase || 'No phase';
      if (!seen.has(p)) { seen.add(p); phases.push(p); }
    }
    return phases;
  }

  phaseCount(phase: string): number {
    const base = this.showAll ? this.items : this.items.filter(i => i.status === 'ACTIVE');
    if (phase === 'All') return base.length;
    return base.filter(i => (i.currentPhase || 'No phase') === phase).length;
  }

  get filteredItems(): PostingApplicantDTO[] {
    let list = this.showAll ? this.items : this.items.filter(i => i.status === 'ACTIVE');
    if (this.selectedPhase !== 'All') {
      list = list.filter(i => (i.currentPhase || 'No phase') === this.selectedPhase);
    }
    return [...list].sort((a, b) => {
      if (this.scoreView === 'bulk') {
        return (b.bulkAiScore ?? -1) - (a.bulkAiScore ?? -1);
      } else {
        return (b.autoAiScore ?? -1) - (a.autoAiScore ?? -1);
      }
    });
  }

  get allBulkScored(): boolean {
    const active = this.items.filter(i => i.status === 'ACTIVE');
    return active.length > 0 && active.every(i => i.bulkAiScore != null);
  }

  get allSelected(): boolean {
    const f = this.filteredItems;
    return f.length > 0 && f.every(i => this.selectedIds.has(i.applicationId));
  }

  /** Disable "Select All" when the current view mixes candidates from multiple phases. */
  get isSelectAllDisabled(): boolean {
    if (this.selectedPhase !== 'All') return false;
    const activePhases = new Set(
      this.filteredItems
        .filter(i => i.status === 'ACTIVE')
        .map(i => i.currentPhase ?? '')
    );
    return activePhases.size > 1;
  }

  get selectedCount(): number { return this.selectedIds.size; }

  selectPhase(phase: string) { this.selectedPhase = phase; this.clearSelection(); }

  clearSelection() { this.selectedIds = new Set<number>(); }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.filteredItems
        .filter(i => !this.isCheckboxDisabled(i))
        .forEach(i => this.selectedIds.add(i.applicationId));
    } else {
      this.filteredItems.forEach(i => this.selectedIds.delete(i.applicationId));
    }
    this.selectedIds = new Set(this.selectedIds);
  }

  toggleSelect(id: number, checked: boolean) {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  // ===== Phase-aware bulk selection =====

  get selectedItems(): PostingApplicantDTO[] {
    return this.filteredItems.filter(i => this.selectedIds.has(i.applicationId));
  }

  get isFromTest(): boolean {
    return this.selectedBulkPhase === 'Test';
  }

  get allBulkTestScoresFilled(): boolean {
    return this.selectedItems.every(i => {
      const s = this.bulkTestScores.get(i.applicationId);
      return s !== null && s !== undefined && !isNaN(Number(s));
    });
  }

  setBulkTestScore(applicationId: number, value: number): void {
    this.bulkTestScores.set(applicationId, isNaN(value) ? null : value);
  }

  private initBulkTestScores(): void {
    this.bulkTestScores = new Map();
    this.selectedItems.forEach(i => this.bulkTestScores.set(i.applicationId, null));
  }

  openBulkRefuse(): void {
    this.bulkActionError = '';
    this.bulkActionSuccess = '';
    this.bulkRefuseReason = '';
    this.initBulkTestScores();
    this.bulkRefuseOpen = true;
  }

  get selectedBulkPhase(): string | null {
    if (this.selectedIds.size === 0) return null;
    const first = this.filteredItems.find(i => this.selectedIds.has(i.applicationId));
    return first?.currentPhase ?? null;
  }

  isCheckboxDisabled(item: PostingApplicantDTO): boolean {
    if (item.status !== 'ACTIVE') return true;
    if (this.selectedIds.has(item.applicationId)) return false;
    if (this.selectedIds.size === 0) return false;
    return (item.currentPhase ?? '') !== this.selectedBulkPhase;
  }

  get nextBulkPhase(): string | null {
    if (this.selectedIds.size === 0) return null;
    const first = this.filteredItems.find(i => this.selectedIds.has(i.applicationId));
    if (!first?.phases?.length) return null;
    const current = first.currentPhase;
    if (!current) return first.phases[0] ?? null;
    const idx = first.phases.indexOf(current);
    return first.phases[idx + 1] ?? null;
  }

  get bulkProceedAction(): 'test' | 'interview' | 'offer' | null {
    switch (this.nextBulkPhase) {
      case 'Test':     return 'test';
      case 'Intervju': return 'interview';
      case 'Ponuda':   return 'offer';
      default:         return null;
    }
  }

  openBulkProceed(): void {
    this.bulkActionError = '';
    this.bulkActionSuccess = '';
    if (this.isFromTest) { this.initBulkTestScores(); }
    switch (this.bulkProceedAction) {
      case 'test':      this.bulkTestOpen = true;      break;
      case 'interview': this.bulkInterviewOpen = true; break;
      case 'offer':     this.bulkOfferOpen = true;     break;
    }
  }


  scoreBadgeCss(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    if (score >= 40) return 'score-low';
    return 'score-very-low';
  }

  runBulkScore(): void {
    this.bulkScoring = true;
    this.bulkScoreError = '';
    this.bulkScoreSuccess = '';
    this.svc.bulkScore(this.postingId).subscribe({
      next: (res) => {
        this.bulkScoreSuccess = `${res.scoredCount} candidate(s) scored successfully.`;
        this.svc.getCardsByPosting(this.postingId).subscribe({
          next: (list) => { this.items = list; this.bulkScoring = false; },
          error: () => { this.bulkScoring = false; }
        });
      },
      error: (err) => {
        this.bulkScoreError = err?.error?.message ?? 'Bulk scoring failed. Please try again.';
        this.bulkScoring = false;
      }
    });
  }


  private selectedApplicationIds(): number[] {
    return this.filteredItems
      .filter(i => this.selectedIds.has(i.applicationId))
      .map(i => i.applicationId);
  }

  private afterBulkAction() {
    this.bulkActionLoading = false;
    this.clearSelection();
    this.svc.getCardsByPosting(this.postingId).subscribe({
      next: (list) => { this.items = list; }
    });
  }

  confirmBulkRefuse(): void {
    if (!this.bulkRefuseReason.trim()) return;
    if (this.isFromTest && !this.allBulkTestScoresFilled) return;
    this.bulkActionLoading = true;
    this.bulkActionError = '';
    this.bulkActionSuccess = '';

    if (this.isFromTest) {
      const entries: BulkTestScoreEntry[] = this.selectedApplicationIds().map(id => ({
        applicationId: id,
        score: this.bulkTestScores.get(id)!
      }));
      this.svc.bulkRefuseAfterTest({ entries, reason: this.bulkRefuseReason }).subscribe({
        next: () => {
          this.bulkRefuseOpen = false;
          this.bulkRefuseReason = '';
          this.bulkTestScores = new Map();
          this.bulkActionSuccess = 'Selected candidates refused after test.';
          this.afterBulkAction();
        },
        error: (err) => {
          this.bulkActionError = err?.error?.message ?? 'Bulk refuse failed.';
          this.bulkActionLoading = false;
        }
      });
    } else {
      this.svc.bulkRefuse(this.selectedApplicationIds(), this.bulkRefuseReason).subscribe({
        next: () => {
          this.bulkRefuseOpen = false;
          this.bulkRefuseReason = '';
          this.bulkActionSuccess = 'Selected candidates refused.';
          this.afterBulkAction();
        },
        error: (err) => {
          this.bulkActionError = err?.error?.message ?? 'Bulk refuse failed.';
          this.bulkActionLoading = false;
        }
      });
    }
  }

  onBulkTestFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bulkTestFile = input.files?.[0] ?? null;
  }

  confirmBulkTest(): void {
    if (!this.bulkTestFile || !this.bulkTestActiveUntil) return;
    this.bulkActionLoading = true;
    this.bulkActionError = '';
    this.bulkActionSuccess = '';
    const isoUntil = new Date(this.bulkTestActiveUntil).toISOString();
    this.svc.bulkSendTest(this.selectedApplicationIds(), this.bulkTestType, isoUntil, this.bulkTestFile).subscribe({
      next: () => {
        this.bulkTestOpen = false;
        this.bulkTestFile = null;
        this.bulkTestActiveUntil = '';
        this.bulkActionSuccess = 'Test sent to selected candidates.';
        this.afterBulkAction();
      },
      error: (err) => {
        this.bulkActionError = err?.error?.message ?? 'Bulk test invite failed.';
        this.bulkActionLoading = false;
      }
    });
  }

  isInterviewObserverSelected(id: number): boolean {
    return this.bulkInterviewObserverIds.has(id);
  }

  onInterviewObserverChange(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.bulkInterviewObserverIds.add(id);
    else this.bulkInterviewObserverIds.delete(id);
  }

  get interviewSlotPreview(): { name: string; time: string }[] {
    if (!this.bulkInterviewFirstAt || !this.bulkInterviewDuration) return [];
    const selected = this.filteredItems.filter(i => this.selectedIds.has(i.applicationId));
    const gap = (this.bulkInterviewDuration ?? 0) + (this.bulkInterviewBreak ?? 15);
    return selected.map((item, i) => {
      const t = new Date(this.bulkInterviewFirstAt);
      t.setMinutes(t.getMinutes() + i * gap);
      return { name: item.candidateName, time: t.toLocaleString('sr-RS') };
    });
  }

  confirmBulkInterview(): void {
    if (!this.bulkInterviewFirstAt || !this.bulkInterviewLocation ||
        !this.bulkInterviewDuration || !this.bulkInterviewerId) return;
    if (this.isFromTest && !this.allBulkTestScoresFilled) return;
    this.bulkActionLoading = true;
    this.bulkActionError = '';
    this.bulkActionSuccess = '';
    const dto: BulkInterviewScheduleDTO = {
      applicationIds: this.selectedApplicationIds(),
      interviewType: this.bulkInterviewType,
      location: this.bulkInterviewLocation,
      durationMinutes: this.bulkInterviewDuration,
      firstScheduledAt: new Date(this.bulkInterviewFirstAt).toISOString(),
      breakMinutes: this.bulkInterviewBreak ?? 15,
      interviewerId: this.bulkInterviewerId,
      observerIds: this.bulkInterviewObserverIds.size > 0
        ? Array.from(this.bulkInterviewObserverIds) : undefined,
      testScores: this.isFromTest
        ? this.selectedApplicationIds().map(id => ({ applicationId: id, score: this.bulkTestScores.get(id)! }))
        : undefined
    };
    this.svc.bulkScheduleInterview(dto).subscribe({
      next: () => {
        this.bulkInterviewOpen = false;
        this.bulkInterviewObserverIds = new Set();
        this.bulkInterviewFirstAt = '';
        this.bulkInterviewLocation = '';
        this.bulkInterviewDuration = null;
        this.bulkTestScores = new Map();
        this.bulkActionSuccess = 'Interviews scheduled for selected candidates.';
        this.afterBulkAction();
      },
      error: (err) => {
        this.bulkActionError = err?.error?.message ?? 'Bulk interview scheduling failed.';
        this.bulkActionLoading = false;
      }
    });
  }

  confirmBulkOffer(): void {
    if (!this.bulkOfferStartDate) return;
    if (this.isFromTest && !this.allBulkTestScoresFilled) return;
    this.bulkActionLoading = true;
    this.bulkActionError = '';
    this.bulkActionSuccess = '';
    const testScores: BulkTestScoreEntry[] | undefined = this.isFromTest
      ? this.selectedApplicationIds().map(id => ({ applicationId: id, score: this.bulkTestScores.get(id)! }))
      : undefined;
    this.svc.bulkMakeOffer(
      this.selectedApplicationIds(),
      this.bulkOfferStartDate,
      this.bulkOfferValidUntil || undefined,
      testScores
    ).subscribe({
      next: () => {
        this.bulkOfferOpen = false;
        this.bulkOfferStartDate = '';
        this.bulkOfferValidUntil = '';
        this.bulkTestScores = new Map();
        this.bulkActionSuccess = 'Offers sent to selected candidates.';
        this.afterBulkAction();
      },
      error: (err) => {
        this.bulkActionError = err?.error?.message ?? 'Bulk offer failed.';
        this.bulkActionLoading = false;
      }
    });
  }

  seniorityBadge(seniority: string | undefined | null): { emoji: string; label: string; css: string } {
    switch (seniority) {
      case 'INTERN':    return { emoji: '🎓', label: 'Intern',    css: 'seniority-intern' };
      case 'JUNIOR':    return { emoji: '🌱', label: 'Junior',    css: 'seniority-junior' };
      case 'MID':       return { emoji: '💼', label: 'Mid',       css: 'seniority-mid' };
      case 'SENIOR':    return { emoji: '⭐', label: 'Senior',    css: 'seniority-senior' };
      case 'LEAD':      return { emoji: '🚀', label: 'Lead',      css: 'seniority-lead' };
      case 'PRINCIPAL': return { emoji: '👑', label: 'Principal', css: 'seniority-principal' };
      default:          return { emoji: '💼', label: 'General',   css: 'seniority-default' };
    }
  }

  viewApplication(a: PostingApplicantDTO) {
    this.router.navigate(['/applications', a.applicationId]);
  }

  downloadCv(url: string) {
    window.location.href = url;
  }

  goBack() {
    this.router.navigate(['/applications/overview']);
  }
}
