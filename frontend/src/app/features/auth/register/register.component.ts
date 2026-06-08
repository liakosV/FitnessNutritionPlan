import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { ApiErrorService } from '../../../core/api/api-error.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorComponent } from '../../../shared/ui/form-error/form-error.component';

const PASSWORD_PATTERN = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[@#$%!^&*]).{8,}$/;

@Component({
  selector: 'app-register',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
    }),
  });

  protected loading = false;
  protected error = '';

  protected onSubmit(): void {
    this.error = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.notification.success('Account created. You can log in now.');
        this.router.navigate(['/auth/login']);
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = this.apiError.message(error);
      },
    });
  }
}
