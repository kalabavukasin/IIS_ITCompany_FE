import { Component, OnInit } from '@angular/core';
import { RequestionResponse } from '../model/requestion.model';
import { JobRequestService } from '../job-request.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.css']
})
export class RequestsListComponent implements OnInit {
  title = 'Requests to approve';
  items: RequestionResponse[] = [];
  loading = false;
  error = '';

  isHR = false;
  isHiring = false;
  userId!: number;

  constructor(
    private svc: JobRequestService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getLoggedInUser();
    if (!user) { this.router.navigate(['']); return; }

    this.userId = user.id;
    this.isHR = user.role === 'HR_MANAGER';
    this.isHiring = user.role === 'HIRING_MANAGER';

    if (!this.isHR && !this.isHiring) { this.router.navigate(['']); return; }

    this.title = this.isHR ? 'My job requests' : 'Requests to approve';
    this.load();
  }

  load() {
    this.loading = true;
    const obs = this.isHR
      ? this.svc.listMine(this.userId)
      : this.svc.listToApprove(this.userId);

    obs.subscribe({
      next: (res) => { this.items = res; this.loading = false; },
      error: (err) => { this.error = err?.error?.message ?? 'Loading failed'; this.loading = false; }
    });
  }

  openUntil(iso: string): Date {
    const d = new Date(iso);
    d.setDate(d.getDate() + 30);
    return d;
  }

  more(id: number) {
    this.router.navigate(['/request', id]);
    //console.log("YOU JUST WANT MORE AND MORE");
  }
}
