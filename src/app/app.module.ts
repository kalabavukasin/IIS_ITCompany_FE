import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './infrastructure/auth/login/login.component';
import { RegisterComponent } from './infrastructure/auth/register/register.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivationComponent } from './infrastructure/auth/activation/activation.component';
import { HomeComponent } from './layout/home/home.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { CreateJobRequestComponent } from './job/create-job-request/create-job-request.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestsListComponent } from './job/requests-list/requests-list.component';
import { RequestViewComponent } from './job/request-view/request-view.component';
import { JobListComponent } from './job/job-list/job-list.component';
import { JobViewComponent } from './job/job-view/job-view.component';
import { UserProfileComponent } from './infrastructure/auth/user-profile/user-profile.component';
import { ApplicationsOverviewComponent } from './job/applications-overview/applications-overview.component';
import { ApplicationDetailsComponent } from './job/application-details/application-details.component';
import { ApplicationViewComponent } from './job/application-view/application-view.component';
import { InterviewShowComponent } from './job/interview-show/interview-show.component';
import { ReportModalComponent } from './layout/report-modal/report-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ActivationComponent,
    HomeComponent,
    NavbarComponent,
    CreateJobRequestComponent,
    RequestsListComponent,
    RequestViewComponent,
    JobListComponent,
    JobViewComponent,
    UserProfileComponent,
    ApplicationsOverviewComponent,
    ApplicationDetailsComponent,
    ApplicationViewComponent,
    InterviewShowComponent,
    ReportModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
