import { Component, OnInit } from '@angular/core';
import { ApplicationCardDTO, UserProfile, UserService } from '../../user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ApplicationDTO } from 'src/app/job/model/job-posting.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profile!: UserProfile;
  //apps: ApplicationDTO[] = [];
  loading = false;
  error = '';

  showPhoneEdit = false;
  showPwdEdit = false;

  apps: ApplicationCardDTO[] = [];

  phoneForm = this.fb.group({ phone: ['', [Validators.required, Validators.minLength(6)]] });
  pwdForm   = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private svc: UserService
  ) {}

  ngOnInit(): void {
    const u = this.auth.getLoggedInUser();
    if (!u || u.role !== 'CANDIDATE') { this.router.navigate(['']); return; }
    if (u?.id) this.load(u.id);

    this.loading = true;
    this.svc.getProfile(u.id).subscribe({
      next: p => { this.profile = p; this.phoneForm.patchValue({ phone: p.phone ?? '' }); this.loading = false; },
      error: e => { this.error = e?.error?.message ?? 'Failed to load profile'; this.loading = false; }
    });

   // this.svc.myApplications(u.id).subscribe({
    //  next: list => this.apps = list,
    //  error: _ => {}
   // });
  }
  private load(candidateId: number) {
    this.svc.myApplicationCards(candidateId).subscribe({
      next: list => this.apps = list,
      error: err => console.error(err)
    });
  }

  savePhone() {
    if (this.phoneForm.invalid || !this.profile) return;
    this.svc.updatePhone(this.profile.id, this.phoneForm.value.phone!)
      .subscribe({
        next: p => { this.profile = p; this.showPhoneEdit = false; },
        error: e => this.error = e?.error?.message ?? 'Failed to update phone'
      });
  }

  savePassword() {
    if (this.pwdForm.invalid || !this.profile) return;
    const { oldPassword, newPassword } = this.pwdForm.value;
    this.svc.changePassword(this.profile.id, oldPassword!, newPassword!)
      .subscribe({
        next: () => { this.showPwdEdit = false; this.pwdForm.reset(); },
        error: e => this.error = e?.error?.message ?? 'Failed to change password'
      });
  }

  appMore(a: ApplicationCardDTO) {
    // vodi na detalj aplikacije (kada ga napraviš)
    // this.router.navigate(['/applications', a.id]);
    console.log('More...', a);
  }

}
