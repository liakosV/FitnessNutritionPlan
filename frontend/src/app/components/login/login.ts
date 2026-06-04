import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth: Auth = inject(Auth);

  credentials = {
    username: '',
    password: '',
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.auth.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Login successful.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password.';
      },
    });
  }
}
