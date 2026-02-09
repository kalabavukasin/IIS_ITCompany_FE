import { Component, OnInit } from '@angular/core';
import { InterviewStatus, InterviewToShowDTO } from '../model/interview-show.model';
import { InterviewsService } from '../interview.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { EvaluationsService } from '../evaluations.service';

type AppRole = 'INTERVIEWER' | 'HR_MANAGER' | 'HIRING_MANAGER' | string;
@Component({
  selector: 'app-interview-show',
  templateUrl: './interview-show.component.html',
  styleUrls: ['./interview-show.component.css']
})
export class InterviewShowComponent implements OnInit {


  loading = false;
  error = '';
  items: InterviewToShowDTO[] = [];
  showEvalModal = false;
  evalForInterviewId: number | null = null;
  evalComment = '';
  evalGrade: number | null = null;
  loggedInterviewerId!: number;

  loggedUserId!: number;
  loggedRole!: AppRole;
  

  constructor(private interviews: InterviewsService, private router: Router, private auth: AuthService, private evals: EvaluationsService) {}

  ngOnInit(): void {
    const u = this.auth.getLoggedInUser();
    if (!u) { this.router.navigate(['']); return; }

    this.loggedUserId = u.id;
    this.loggedRole = u.role as AppRole; // ← bez type cast-a

    // Dozvoljene role za ovu stranicu
    const allowed: AppRole[] = ['INTERVIEWER', 'HR_MANAGER', 'HIRING_MANAGER'];
    if (!allowed.includes(this.loggedRole)) { this.router.navigate(['']); return; }

    // Grananje po roli:
    this.fetch(this.loggedUserId, this.loggedRole);
  }

  private fetch(userId: number, role: AppRole) {
    this.loading = true;
    this.error = '';

    const src$ = role === 'INTERVIEWER'
      ? this.interviews.getByInterviewerId(userId)
      : this.interviews.getObservedByUserId(userId); // HR/HIRING_MANAGER

    src$.subscribe({
      next: (res) => { this.items = res ?? []; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Failed to load interviews.'; this.loading = false; }
    });
  }

  evaluate(i: InterviewToShowDTO) {
    this.router.navigate(['/interviews', i.id, 'evaluate']);
  }

  prettyEnum(v: string): string {
    return v
      .toLowerCase()
      .split('_')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  }

  statusClass(s: InterviewStatus): string {
    switch (s) {
      case 'SCHEDULED':
        return 'badge badge-scheduled';
      case 'COMPLETED':
        return 'badge badge-completed';
      case 'CANCELED':
        return 'badge badge-canceled';
      case 'NO_SHOW':
        return 'badge badge-no-show';
      default:
        return 'badge';
    }
  }
  canEvaluate(i: InterviewToShowDTO): boolean {
    if (this.loggedRole !== 'INTERVIEWER') return false;
    if (i.status !== 'SCHEDULED') return false;
    const now = new Date();
    const sched = new Date(i.scheduledAt);
    const graceMs = 24 * 60 * 60 * 1000; // 1 dan
    return now.getTime() <= (sched.getTime() + graceMs);
  }

  openEval(i: InterviewToShowDTO) {
    if (!this.canEvaluate(i)) return;
    this.evalForInterviewId = i.id;
    this.evalComment = '';
    this.evalGrade = null;
    this.showEvalModal = true;
  }

  cancelEval() {
    this.showEvalModal = false;
  }

  submitEval() {
    if (!this.evalForInterviewId || this.evalGrade === null) return;
    if (this.evalGrade < 1 || this.evalGrade > 10) {
      alert('Grade must be between 1 and 10.');
      return;
    }
    this.evals.create({
      interviewId: this.evalForInterviewId,
      interviewerId: this.loggedUserId,
      grade: String(this.evalGrade),
      comment: this.evalComment ?? ''
    }).subscribe({
      next: _ => { this.showEvalModal = false; this.fetch(this.loggedUserId, this.loggedRole); },
      error: err => alert(err?.error?.message || 'Failed to submit evaluation.')
    });
  }
  
}
