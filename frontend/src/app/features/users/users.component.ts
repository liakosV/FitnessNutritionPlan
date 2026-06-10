import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { ApiErrorService } from '../../core/api/api-error.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { Role, UserReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-users',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatOptionModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    PageHeaderComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);

  protected readonly columns = ['username', 'email', 'role', 'uuid', 'actions'];
  protected readonly roles: Role[] = ['ROLE_ADMIN', 'ROLE_COACH', 'ROLE_USER'];
  protected readonly users = signal<UserReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.apiError.message(error));
        this.loading.set(false);
      },
    });
  }

  protected changeRole(user: UserReadDto, role: Role): void {
    this.api.changeRole(user.uuid, role).subscribe({
      next: (updated) => {
        this.users.update((users) => users.map((entry) => (entry.uuid === updated.uuid ? updated : entry)));
        this.notification.success('Role updated.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected deleteUser(user: UserReadDto): void {
    const confirmed = window.confirm(`Delete ${user.username}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(user.uuid).subscribe({
      next: () => {
        this.users.update((users) => users.filter((entry) => entry.uuid !== user.uuid));
        this.notification.success('User deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}
