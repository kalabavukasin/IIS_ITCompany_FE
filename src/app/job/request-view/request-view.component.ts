import { Component, OnInit } from '@angular/core';
import { RequestionResponse } from '../model/requestion.model';
import { ActivatedRoute, Router } from '@angular/router';
import { JobRequestService } from '../job-request.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { UserService } from 'src/app/infrastructure/user.service';

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.css']
})
export class RequestViewComponent implements OnInit {
  data?: RequestionResponse;
  loading = false;
  error = '';

  isHR = false;
  isHiring = false;
  modalOpen = false;
  modalAction: 'approve' | 'reject' | null = null;
  comment = '';
  commentErr = '';
  approveDurationDays: number | null = null;
  useCustomDuration = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: JobRequestService,
    private auth: AuthService,
    private users: UserService
  ) {}

  openModal(action: 'approve' | 'reject') {
    if (!this.data) return;
    this.modalAction = action;
    this.comment = '';
    this.commentErr = '';
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.modalAction = null;
    this.comment = '';
    this.commentErr = '';
    this.approveDurationDays = null;
    this.useCustomDuration = false;
  }

  confirmModal() {
    if (!this.data || !this.modalAction) return;
    if (!this.comment || this.comment.trim().length < 2) {
      this.commentErr = 'Comment is required (min 2 chars).';
      return;
    }
    const id = this.data.id;

    const obs = this.modalAction === 'approve'
      ? this.svc.approve(id, this.comment.trim(), this.approveDurationDays)
      : this.svc.reject(id, this.comment.trim());

    obs.subscribe({
      next: (res) => {
        this.data = res;
        this.closeModal();
        this.error = ''; // Clearprevious errors
      },
      error: (err) => {
        console.error('Error during approve/reject:', err);
        this.closeModal();

        // Extract error messages
        let errorMsg = 'Action failed.';

        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (typeof err?.error === 'string') {
          errorMsg = err.error;
        } else if (err?.statusText) {
          errorMsg = err.statusText;
        }

        if (errorMsg.toLowerCase().includes('candidates have already applied') ||
            errorMsg.toLowerCase().includes('cannot reject')) {
          this.error = 'Cannot reject: Candidates have already applied to this job posting.';
        } else if (errorMsg.toLowerCase().includes('cannot approve') &&
                   errorMsg.toLowerCase().includes('draft')) {
          this.error = 'Cannot approve requestion in DRAFT status.';
        } else if (errorMsg.toLowerCase().includes('cannot approve') &&
                   errorMsg.toLowerCase().includes('closed')) {
          this.error = 'Cannot approve requestion in CLOSED status.';
        } else {
          this.error = '' + errorMsg;
        }
      }
    });
  }

  ngOnInit(): void {
    const user = this.auth.getLoggedInUser?.() ?? JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { this.router.navigate(['/home']); return; }

    this.isHR = user.role === 'HR_MANAGER';
    this.isHiring = user.role === 'HIRING_MANAGER';

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/requests']); return; }

    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;

        if (this.data?.createdById) {
          this.users.getById(this.data.createdById).subscribe(u => {
            this.data!.createdByFullName =
              `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
          });
        }
      },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to load request.'; this.loading = false; }
    });
  }

  canApprove(): boolean {
    if (!this.isHiring || !this.data) return false;
    return ['REJECTED', 'PENDING_APPROVAL'].includes(this.data.status);
  }

  canReject(): boolean {
    if (!this.isHiring || !this.data) return false;
    return ['APPROVED', 'PENDING_APPROVAL'].includes(this.data.status);
  }

  showButtons(): boolean {
    if (!this.isHiring || !this.data) return false;
    return !['DRAFT', 'CLOSED'].includes(this.data.status);
  }

 /* approve() {
    if (!this.data) return;
    this.svc.approve(this.data.id, this.userId).subscribe({
      next: (res) => { this.data = res; }, // status se osvežava, dugmići nestaju
      error: (err) => { this.error = err?.error?.message ?? 'Approve failed.'; }
    });
  }

  reject() {
    if (!this.data) return;
    this.svc.reject(this.data.id, this.userId).subscribe({
      next: (res) => { this.data = res; },
      error: (err) => { this.error = err?.error?.message ?? 'Reject failed.'; }
    });
  }*/
}
