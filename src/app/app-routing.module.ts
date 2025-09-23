import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './infrastructure/auth/login/login.component';
import { RegisterComponent } from './infrastructure/auth/register/register.component';
import { ActivationComponent } from './infrastructure/auth/activation/activation.component';
import { HomeComponent } from './layout/home/home.component';
import { CreateJobRequestComponent } from './job/create-job-request/create-job-request.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivationComponent },
  { path: 'jobs/create', component: CreateJobRequestComponent},
  { path: '', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
