import { Component, OnInit } from '@angular/core';
import { Seniority } from '../model/requestion.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobRequestService } from '../job-request.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'app-create-job-request',
  templateUrl: './create-job-request.component.html',
  styleUrls: ['./create-job-request.component.css']
})
export class CreateJobRequestComponent implements OnInit {

  seniorities: Seniority[] = ['INTERN','JUNIOR','MID','SENIOR','LEAD','PRINCIPAL'];
  userId: number | null = null;

  form = this.fb.group({
    positionInFirm: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    programmingLanguages: ['', [Validators.required]], // unosi: "Java, Spring"
    seniority: ['JUNIOR' as Seniority, Validators.required],
    location: ['', [Validators.required]],
    budget: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  submitting = false;
  serverError = '';

  constructor(private fb: FormBuilder, private svc: JobRequestService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getLoggedInUser();
    if (!user || user.role !== 'HR_MANAGER') {
      console.log(user);
      this.router.navigate(['/']);
      return;
    } 
  }
  submit() {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    console.log(this.form.value);
   // this.svc.create(this.form.value as any).subscribe({
    //  next: _ => {
    //    this.submitting = false;
        //this.router.navigate(['/jobs']); // ili gde želiš nakon kreiranja
   //   },
    //  error: err => {
    //    this.submitting = false;
    //    this.serverError = err?.error?.message ?? 'Došlo je do greške pri čuvanju.';
    //  }
   // });
  }

  cancel() {
    //this.router.navigate(['/jobs']); // ili na dashboard
  }

  // helperi za prikaz grešaka ispod polja
  hasError(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}
