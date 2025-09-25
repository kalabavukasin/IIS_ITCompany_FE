import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './infrastructure/auth/login/login.component';
import { RegisterComponent } from './infrastructure/auth/register/register.component';
import { ActivationComponent } from './infrastructure/auth/activation/activation.component';
import { HomeComponent } from './layout/home/home.component';
import { CreateJobRequestComponent } from './job/create-job-request/create-job-request.component';
import { RequestsListComponent } from './job/requests-list/requests-list.component';
import { RequestViewComponent } from './job/request-view/request-view.component';
import { JobListComponent } from './job/job-list/job-list.component';
import { JobViewComponent } from './job/job-view/job-view.component';
import { UserProfileComponent } from './infrastructure/auth/user-profile/user-profile.component';
import { ApplicationsOverviewComponent } from './job/applications-overview/applications-overview.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivationComponent },
  { path: 'jobs/create', component: CreateJobRequestComponent},
  { path: 'requests', component: RequestsListComponent},
  { path: 'request/:id', component: RequestViewComponent},
  { path: 'jobs', component: JobListComponent},
  { path: 'jobs/:id', component: JobViewComponent},
  { path: 'profile', component: UserProfileComponent},
  { path: 'applications/overview', component: ApplicationsOverviewComponent},
  { path: '', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
