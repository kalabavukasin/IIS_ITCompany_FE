import { Component } from '@angular/core';
import { ApplicationDetailsDto, ApplicationService } from '../application.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.css']
})
export class ApplicationDetailsComponent {

  data?: ApplicationDetailsDto;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private svc: ApplicationService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getDetails(id).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: _ => { this.error = 'Failed to load details.'; this.loading = false; }
    });
  }

  downloadCv() {
    if (this.data?.cvDownloadUrl) {
      window.location.href = this.data.cvDownloadUrl;
    }
  }

  advance() {
    console.log("advance");
  }

  refuse() {
    console.log("refuse");
  }
}
