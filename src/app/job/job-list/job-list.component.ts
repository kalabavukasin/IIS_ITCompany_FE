import { Component, OnInit } from '@angular/core';
import { JobPostingService } from '../job-posting.service';
import { Router } from '@angular/router';
import { JobPostingCard } from '../model/job-posting.model';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  title = 'List of jobs';
  items: JobPostingCard[] = [];
  loading = false;
  error = '';

  constructor(private svc: JobPostingService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.svc.listOpen().subscribe({
      next: res => { this.items = res; this.loading = false; },
      error: err => { this.error = err?.error?.message ?? 'Loading failed'; this.loading = false; }
    });
  }

  more(id: number) {
     this.router.navigate(['/jobs', id]); 
     //console.log("PEOPLE JUST WANT MORE AND MORE");
    }

}
