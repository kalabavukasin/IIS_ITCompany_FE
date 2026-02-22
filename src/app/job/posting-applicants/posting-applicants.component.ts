import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService, ApplicationWithUserDTO } from '../application.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { JobPostingService } from '../job-posting.service';

// TODO: bulk actions — send test, make offer, schedule interview

@Component({
  selector: 'app-posting-applicants',
  templateUrl: './posting-applicants.component.html',
  styleUrls: ['./posting-applicants.component.css']
})
export class PostingApplicantsComponent implements OnInit {
  items: ApplicationWithUserDTO[] = [];
  loading = true;
  error = '';
  postingId!: number;

  // Posting info (loaded via GET /api/postings/{id})
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

  // Action state
  showExtendInput = false;
  showRepublishInput = false;
  extendDate = '';
  republishDate = '';
  actionError = '';
  actionLoading = false;

  get validToInPast(): boolean {
    if (!this.postingOpenUntil) return true;
    return new Date(this.postingOpenUntil) < new Date(new Date().toDateString());
  }

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ApplicationService,
    private postingSvc: JobPostingService,
    private auth: AuthService
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
      next: (list) => {
        this.items = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load applicants.';
        this.loading = false;
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

  get filteredItems(): ApplicationWithUserDTO[] {
    let list = this.showAll ? this.items : this.items.filter(i => i.status === 'ACTIVE');
    if (this.selectedPhase !== 'All') {
      list = list.filter(i => (i.currentPhase || 'No phase') === this.selectedPhase);
    }
    return list;
  }

  get allSelected(): boolean {
    const f = this.filteredItems;
    return f.length > 0 && f.every(i => this.selectedIds.has(i.applicationId));
  }

  get selectedCount(): number { return this.selectedIds.size; }

  selectPhase(phase: string) { this.selectedPhase = phase; this.clearSelection(); }

  clearSelection() { this.selectedIds = new Set<number>(); }

  toggleSelectAll(checked: boolean) {
    if (checked) this.filteredItems.forEach(i => this.selectedIds.add(i.applicationId));
    else this.filteredItems.forEach(i => this.selectedIds.delete(i.applicationId));
    this.selectedIds = new Set(this.selectedIds); // trigger change detection
  }

  toggleSelect(id: number, checked: boolean) {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.selectedIds = new Set(this.selectedIds);
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

  viewApplication(a: ApplicationWithUserDTO) {
    this.router.navigate(['/applications', a.applicationId]);
  }

  downloadCv(url: string) {
    window.location.href = url;
  }

  goBack() {
    this.router.navigate(['/applications/overview']);
  }
}
