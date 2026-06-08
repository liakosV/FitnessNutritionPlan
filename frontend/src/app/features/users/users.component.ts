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
  template: `
    <app-page-header
      title="Users"
      description="Reads /api/users, changes roles with /api/users/:uuid/role, and deletes users through the admin endpoint."
    />

    <app-form-error [message]="error()" />

    <mat-card appearance="outlined">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-wrap">
        <table mat-table [dataSource]="users()">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let user">{{ user.username }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <mat-select [value]="user.role" (selectionChange)="changeRole(user, $event.value)">
                @for (role of roles; track role) {
                  <mat-option [value]="role">{{ role }}</mat-option>
                }
              </mat-select>
            </td>
          </ng-container>

          <ng-container matColumnDef="uuid">
            <th mat-header-cell *matHeaderCellDef>UUID</th>
            <td mat-cell *matCellDef="let user" class="uuid">{{ user.uuid }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let user">
              <button mat-button type="button" color="warn" (click)="deleteUser(user)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && users().length === 0) {
        <p class="empty">No users returned by the backend.</p>
      }
    </mat-card>
  `,
  styles: `
    mat-card {
      overflow: hidden;
      border-color: #c8ddd5;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .uuid {
      max-width: 240px;
      color: #526b62;
      font-family: Consolas, monospace;
      font-size: 0.82rem;
      word-break: break-all;
    }

    mat-select {
      width: 150px;
    }

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }
  `,
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
