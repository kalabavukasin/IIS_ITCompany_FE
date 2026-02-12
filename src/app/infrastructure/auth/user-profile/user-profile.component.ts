import { Component, OnInit } from '@angular/core';
import { ApplicationCardDTO, OfferCardDTO, UserProfile, UserService } from '../../user.service';
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
  offers: OfferCardDTO[] = [];
  showAcceptModal = false;
  offerToAccept: OfferCardDTO | null = null;

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
    this.load();

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
  private load() {
    this.svc.myApplicationCards().subscribe({
      next: list => this.apps = list,
      error: err => console.error(err)
    });
    this.loadOffers();
  }
  private loadOffers(){
    this.svc.myRecentOffers(30).subscribe({
      next: (offers) => { this.offers = offers ?? []; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Failed to load offers.'; this.loading = false; }
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
    this.router.navigate(['/viewApplication/', a.applicationId]);
  }
  acceptOffer(o: OfferCardDTO) {
    console.log('Accept offer', o.offerId);
  }
  isAcceptEnabled(o: OfferCardDTO) { return o.status === 'SENT'; }

  // klik na Accept → otvori modal
  openAccept(o: OfferCardDTO) {
    if (!this.isAcceptEnabled(o)) return;
    this.offerToAccept = o;
    this.showAcceptModal = true;
  }

  cancelAccept() {
    this.showAcceptModal = false;
    this.offerToAccept = null;
  }

  confirmAccept() {
    if (!this.offerToAccept) return;
    this.svc.acceptOffer(this.offerToAccept.offerId).subscribe({
      next: (updated) => {
        // lokalno osveži status kartice (ili refetch cele liste)
        const idx = this.offers.findIndex(x => x.offerId === updated.offerId);
        if (idx >= 0) this.offers[idx] = updated;
        this.cancelAccept();
        this.loadOffers();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to accept offer.');
      }
    });
  }
  confirmDecline() {
    if (!this.offerToAccept) return;
    this.svc.declineOffer(this.offerToAccept.offerId).subscribe({
      next: (updated) => {
        const idx = this.offers.findIndex(x => x.offerId === updated.offerId);
        if (idx >= 0) this.offers[idx] = updated;
        this.cancelAccept();
        this.loadOffers();
      },
      error: (err) => alert(err?.error?.message || 'Failed to decline offer.')
    });
  }

}
