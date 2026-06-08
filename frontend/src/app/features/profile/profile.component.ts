import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ApiErrorService } from '../../core/api/api-error.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  template: `
    <app-page-header
      title="Profile"
      description="Update the authenticated user's profile and password through the Spring Boot /api/users/me endpoints."
    />

    <section class="profile-grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Account</mat-card-title>
          <mat-card-subtitle>
            Signed in as {{ currentUser()?.username }} · {{ currentUser()?.role }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <app-form-error [message]="profileError" />

            <mat-form-field appearance="outline">
              <mat-label>New username</mat-label>
              <input matInput formControlName="username" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (profileForm.controls.email.invalid && profileForm.controls.email.touched) {
                <mat-error>Enter a valid email.</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button type="submit" [disabled]="profileLoading">
              {{ profileLoading ? 'Saving...' : 'Update profile' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Password</mat-card-title>
          <mat-card-subtitle>Matches the backend ChangePasswordDto.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <app-form-error [message]="passwordError" />

            <mat-form-field appearance="outline">
              <mat-label>Old password</mat-label>
              <input matInput type="password" formControlName="oldPassword" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New password</mat-label>
              <input matInput type="password" formControlName="newPassword" />
            </mat-form-field>

            <button mat-flat-button type="submit" [disabled]="passwordLoading">
              {{ passwordLoading ? 'Saving...' : 'Change password' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: `
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
    }

    mat-card {
      border-color: #c8ddd5;
    }

    form {
      display: grid;
      gap: 16px;
      padding-top: 18px;
    }
  `,
})
export class ProfileComponent {
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly usersApi = inject(UsersApiService);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly profileForm = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
  });
  protected readonly passwordForm = new FormGroup({
    oldPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected profileError = '';
  protected passwordError = '';
  protected profileLoading = false;
  protected passwordLoading = false;

  protected updateProfile(): void {
    this.profileError = '';
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      return;
    }

    const value = this.profileForm.getRawValue();
    this.profileLoading = true;
    this.usersApi
      .updateMe({
        username: value.username || undefined,
        email: value.email || undefined,
      })
      .subscribe({
        next: () => {
          this.profileLoading = false;
          this.profileForm.reset();
          this.notification.success('Profile updated.');
        },
        error: (error: unknown) => {
          this.profileLoading = false;
          this.profileError = this.apiError.message(error);
        },
      });
  }

  protected changePassword(): void {
    this.passwordError = '';
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    this.usersApi.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordForm.reset();
        this.notification.success('Password changed.');
      },
      error: (error: unknown) => {
        this.passwordLoading = false;
        this.passwordError = this.apiError.message(error);
      },
    });
  }
}
