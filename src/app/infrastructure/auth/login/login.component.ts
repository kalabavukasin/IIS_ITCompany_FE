import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private auth: AuthService) {}

  login(): void {
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe(
      () => {
        const user = this.auth.getLoggedInUser();
        console.log('Logged in user:', user);
        console.log(user?.id)
        this.router.navigate(['/']);  // Redirect to the home page or dashboard
      },
      error => {
        this.errorMessage = 'Invalid login credentials';
      }
    );
  }
}
