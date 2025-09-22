import { Component } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  firstName ='';
  lastName = '';
  phone = '';
  successMessage = '';
  errorMessage = '';

  selectedFile: File | null = null;
  cvError = '';

  constructor(private auth: AuthService) {}

  get emailError() {
    return !this.email || !this.email.includes('@');
  }


  get passwordMismatchError() {
    return this.password !== this.confirmPassword;
  }
  get phoneError() {
  return !/^[0-9]*$/.test(this.phone);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.cvError = '';
    if (file) {
      const maxSizeMb = 5;
      const okType = /(pdf|msword|officedocument)/i.test(file.type) || /\.(pdf|doc|docx|odt)$/i.test(file.name);
      const okSize = file.size <= maxSizeMb * 1024 * 1024;

      if (!okType) {
        this.cvError = 'Unsupported file type.';
        this.selectedFile = null;
        return;
      }
      if (!okSize) {
        this.cvError = `File too large (max ${maxSizeMb} MB).`;
        this.selectedFile = null;
        return;
      }
    }
    this.selectedFile = file;
  }

  register(): void {
    if (this.emailError || this.passwordMismatchError) {
      this.errorMessage = 'Please fix the errors before submitting.';
      this.successMessage = '';
      return;
    }
    if (this.cvError) {
      this.errorMessage = this.cvError;
      this.successMessage = '';
      return;
    }

    const payload = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    };

    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (this.selectedFile) {
      form.append('cv', this.selectedFile, this.selectedFile.name);
    }

    this.auth.register(form).subscribe(
      (response) => {
        if (response && response.message) {
          this.successMessage = response.message;
          this.errorMessage = '';
        }
      },
      (error) => {
        if (error.status === 409 && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.successMessage = '';
      }
    );
  }
}
