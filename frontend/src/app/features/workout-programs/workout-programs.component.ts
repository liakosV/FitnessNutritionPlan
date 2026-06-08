import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { WorkoutProgramsApiService } from '../../core/api/workout-programs-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { WorkoutProgramReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusPillComponent } from '../../shared/ui/status-pill/status-pill.component';
import { parseUuidList } from '../../shared/utils/uuid-list';

@Component({
  selector: 'app-workout-programs',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    StatusPillComponent,
  ],
  template: `
    <app-page-header
      title="Workout Programs"
      description="Integrated with /api/workout/programs; admins see all, coaches use /my."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Create program</mat-card-title>
          <mat-card-subtitle>Assigned users must be client ROLE_USER accounts.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="createProgram()">
            <app-form-error [message]="formError" />

            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Assigned user UUIDs</mat-label>
              <input matInput formControlName="assignedUserUuids" placeholder="uuid-1, uuid-2" />
            </mat-form-field>

            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create program' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined" class="list-card">
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        }

        <div class="table-wrap">
          <table mat-table [dataSource]="programs()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let program">
                <strong>{{ program.name }}</strong>
                <span>{{ program.description }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="coach">
              <th mat-header-cell *matHeaderCellDef>Coach</th>
              <td mat-cell *matCellDef="let program">{{ program.coachUsername }}</td>
            </ng-container>

            <ng-container matColumnDef="assigned">
              <th mat-header-cell *matHeaderCellDef>Assigned</th>
              <td mat-cell *matCellDef="let program">{{ program.assignedUsernames.join(', ') || 'None' }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let program">
                <app-status-pill [active]="program.active" />
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let program">
                <a mat-button [routerLink]="['/workout-days']" [queryParams]="{ programUuid: program.uuid }">
                  Days
                </a>
                <button mat-button type="button" (click)="toggleActive(program)">
                  {{ program.active ? 'Deactivate' : 'Activate' }}
                </button>
                <button mat-button type="button" color="warn" (click)="deleteProgram(program)">Delete</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        @if (!loading() && programs().length === 0) {
          <p class="empty">No workout programs returned for this role.</p>
        }
      </mat-card>
    </section>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: minmax(300px, 380px) 1fr;
      gap: 18px;
      align-items: start;
    }

    mat-card {
      border-color: #c8ddd5;
    }

    form {
      display: grid;
      gap: 16px;
      padding-top: 18px;
    }

    .list-card {
      overflow: hidden;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    td strong,
    td span {
      display: block;
    }

    td span {
      max-width: 320px;
      color: #526b62;
    }

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }

    @media (max-width: 980px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class WorkoutProgramsComponent implements OnInit {
  private readonly api = inject(WorkoutProgramsApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);

  protected readonly columns = ['name', 'coach', 'assigned', 'active', 'actions'];
  protected readonly programs = signal<WorkoutProgramReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    assignedUserUuids: new FormControl('', { nonNullable: true }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    this.loadPrograms();
  }

  protected loadPrograms(): void {
    const user = this.auth.currentUser();
    this.loading.set(true);
    const request = user?.role === 'ROLE_ADMIN' ? this.api.getAll() : this.api.getMine();

    request.subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notification.error(this.apiError.message(error));
      },
    });
  }

  protected createProgram(): void {
    this.formError = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.saving = true;
    this.api
      .create({
        name: value.name,
        description: value.description,
        assignedUserUuids: parseUuidList(value.assignedUserUuids),
      })
      .subscribe({
        next: (program) => {
          this.programs.update((programs) => [program, ...programs]);
          this.form.reset();
          this.saving = false;
          this.notification.success('Workout program created.');
        },
        error: (error: unknown) => {
          this.formError = this.apiError.message(error);
          this.saving = false;
        },
      });
  }

  protected toggleActive(program: WorkoutProgramReadDto): void {
    this.api.update(program.uuid, { active: !program.active }).subscribe({
      next: (updated) => {
        this.programs.update((programs) =>
          programs.map((entry) => (entry.uuid === updated.uuid ? updated : entry)),
        );
        this.notification.success('Workout program updated.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected deleteProgram(program: WorkoutProgramReadDto): void {
    const confirmed = window.confirm(`Delete ${program.name}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(program.uuid).subscribe({
      next: () => {
        this.programs.update((programs) => programs.filter((entry) => entry.uuid !== program.uuid));
        this.notification.success('Workout program deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}
