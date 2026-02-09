import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent implements OnInit {
  activationMessage: string = '';
  isError: boolean = false;
  hasActivated: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token && !this.hasActivated) {
      this.hasActivated = true;
      this.activateAccount(token);
    } else {
      this.displayMessage('Invalid activation link.', true);
    }
  }

  private activateAccount(token: string): void {
    this.authService.activateAccount(token).subscribe({
      next: (response) => {
        console.log("Activation successful:", response); // Log success response
        this.displayMessage(response.message || "Account activated successfully.", false);
      },
      error: (error) => {
        console.log("Activation error:", error); // Log error response
        const errorMessage = error.error?.error || "Invalid or expired activation token.";
        this.displayMessage(errorMessage, true);
      }
    });
  }
  

  private displayMessage(message: string, isError: boolean): void {
    this.activationMessage = message;
    this.isError = isError;
  }
}
