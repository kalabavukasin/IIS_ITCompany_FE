import { Component, OnInit } from '@angular/core';
import { ApplicationService, ApplicationWithUserDTO } from '../application.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

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
    this.svc.getAllApplicationCards().subscribe({
      next: (list) => { this.items = list; this.loading = false; },
      error: (_) => { this.error = 'Failed to load applications.'; this.loading = false; }
    });
  }

  more(a: ApplicationWithUserDTO) {
    // npr. navigate na detalj aplikacije ili na oglas
    // this.router.navigate(['/applications', a.applicationId]);
    console.log(a);
  }
}
