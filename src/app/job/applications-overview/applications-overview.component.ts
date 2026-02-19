import { Component, OnInit } from '@angular/core';
import { ApplicationService, ApplicationWithUserDTO } from '../application.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

export interface PostingGroup {
  jobPostingId: number;
  requestName: string;
  requestDescription: string;
  requestLocation?: string;
  seniority?: string;
  openUntil?: string;
  count: number;
}

@Component({
  selector: 'app-applications-overview',
  templateUrl: './applications-overview.component.html',
  styleUrls: ['./applications-overview.component.css']
})
export class ApplicationsOverviewComponent implements OnInit {

  items: ApplicationWithUserDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private svc: ApplicationService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const u = this.auth.getLoggedInUser();
    if (!u || (u.role !== 'HR_MANAGER' && u.role !== 'HIRING_MANAGER')) { this.router.navigate(['']); return; }

    const cards$ = u.role === 'HR_MANAGER'
      ? this.svc.getMyCreatedCards()
      : this.svc.getMyManagedCards();

    cards$.subscribe({
      next: (list) => { this.items = list; this.loading = false; },
      error: (_) => { this.error = 'Failed to load applications.'; this.loading = false; }
    });
  }

  get groupedByPosting(): PostingGroup[] {
    const map = new Map<number, PostingGroup>();
    for (const a of this.items) {
      if (!map.has(a.jobPostingId)) {
        map.set(a.jobPostingId, {
          jobPostingId: a.jobPostingId,
          requestName: a.requestName,
          requestDescription: a.requestDescription,
          requestLocation: a.requestLocation,
          seniority: a.seniority,
          openUntil: a.openUntil,
          count: 0
        });
      }
      map.get(a.jobPostingId)!.count++;
    }
    return Array.from(map.values());
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

  viewPosting(g: PostingGroup) {
    this.router.navigate(['/postings', g.jobPostingId, 'applicants']);
  }
}
