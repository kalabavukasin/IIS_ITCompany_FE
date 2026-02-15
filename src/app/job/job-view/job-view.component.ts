import { Component, OnInit } from '@angular/core';
import { JobPostingDetail } from '../model/job-posting.model';
import { JobPostingService } from '../job-posting.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../application.service';

@Component({
  selector: 'app-job-view',
  templateUrl: './job-view.component.html',
  styleUrls: ['./job-view.component.css']
})
export class JobViewComponent implements OnInit {
  data!: JobPostingDetail;
  loading = false;
  error = '';
  applied = false;
  isCandidate = false;

  constructor(
    private svc: JobPostingService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private application: ApplicationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const user = this.auth.getLoggedInUser();
    if (!user) { this.router.navigate(['']); return; }
    this.isCandidate = user.role === 'CANDIDATE';
     if (!this.isCandidate) { this.router.navigate(['']); return; }

    this.loading = true;
    this.svc.getDetail(id).subscribe({
      next: res => { this.data = res; this.applied = res.alreadyApplied; this.loading = false; },
      error: err => { this.error = err?.error?.message ?? 'Failed to load job.'; this.loading = false; }
    });
  }

  canApply(): boolean {
    const user = this.auth.getLoggedInUser();
    return !!user && user.role === 'CANDIDATE' && !this.applied;
  }

  apply() {
    const user = this.auth.getLoggedInUser();
    if (!user || user.role !== 'CANDIDATE') { this.router.navigate(['/login']); return; }

    this.application.apply(this.data.id).subscribe({
      next: response => { 
        this.applied = true;
        console.log(response) },
      error: err => { this.error = err?.error?.message ?? 'Apply failed.'; }
    });
  }
}
