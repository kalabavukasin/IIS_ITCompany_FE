import { Component, OnInit } from '@angular/core';
import { Seniority, WorkflowSummary } from '../model/requestion.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobRequestService } from '../job-request.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { WorkflowService } from '../workflow.service';

@Component({
  selector: 'app-create-job-request',
  templateUrl: './create-job-request.component.html',
  styleUrls: ['./create-job-request.component.css']
})
export class CreateJobRequestComponent implements OnInit {

  seniorities: Seniority[] = ['INTERN','JUNIOR','MID','SENIOR','LEAD','PRINCIPAL'];
  userId: number | null = null;
  workflows: WorkflowSummary[] = [];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    positionInFirm: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    programmingLanguages: ['', [Validators.required]], // unosi: "Java, Spring"
    seniority: ['JUNIOR' as Seniority, Validators.required],
    location: ['', [Validators.required]],
    budget: [null as number | null, [Validators.required, Validators.min(0)]],
    pipelineWorkflowId: [null as number | null, [Validators.required]]
  });

  submitting = false;
  serverError = '';

  constructor(private fb: FormBuilder, private svc: JobRequestService, private router: Router, private authService: AuthService,
    private wfSvc: WorkflowService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getLoggedInUser();
    if (!user || user.role !== 'HR_MANAGER') {
      this.router.navigate(['/']);
      return;
    }
    else{
      this.userId = user.id;
    }
    this.wfSvc.list().subscribe({
      next: (data) => (this.workflows = data),
      error: () => (this.workflows = [])
    }); 
  }
  submit() {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    ///console.log(this.form.value);
    if(this.userId !== null){
      this.svc.create(this.form.value as any,this.userId).subscribe({
        next: (response) => {
          this.submitting = false;
          console.log('Job request created:', response);
          this.router.navigate(['/requests']);
        },
        error: err => {
          this.submitting = false;
          this.serverError = err?.error?.message ?? 'Došlo je do greške pri čuvanju.';
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/requests']);
  }

  // helperi za prikaz grešaka ispod polja
  hasError(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}
