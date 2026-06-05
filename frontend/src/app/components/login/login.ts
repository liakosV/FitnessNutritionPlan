import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../interfaces/user';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth: AuthService = inject(AuthService);

  credentials: Credentials = {
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
