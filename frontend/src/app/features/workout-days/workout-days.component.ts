import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { WorkoutDaysApiService } from '../../core/api/workout-days-api.service';
import { WorkoutDayReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-workout-days',
  imports: [
    FormErrorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <app-page-header
      title="Workout Days"
      description="Loads /api/workout/programs/:workoutProgramUuid/workout-days and creates days through /api/workout-days."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Program lookup</mat-card-title>
          <mat-card-subtitle>Paste a workout program UUID.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="lookupForm" (ngSubmit)="loadDays()">
            <app-form-error [message]="error()" />
            <mat-form-field appearance="outline">
              <mat-label>Workout program UUID</mat-label>
              <input matInput formControlName="workoutProgramUuid" />
            </mat-form-field>
            <button mat-flat-button type="submit">Load days</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Create day</mat-card-title>
          <mat-card-subtitle>Uses the same workout program UUID.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="createDay()">
            <app-form-error [message]="formError" />
            <mat-form-field appearance="outline">
              <mat-label>Day name</mat-label>
              <input matInput formControlName="dayName" placeholder="Push day" />
            </mat-form-field>
            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create day' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>

    <mat-card appearance="outlined" class="list-card">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-wrap">
        <table mat-table [dataSource]="days()">
          <ng-container matColumnDef="dayName">
            <th mat-header-cell *matHeaderCellDef>Day</th>
            <td mat-cell *matCellDef="let day">{{ day.dayName }}</td>
          </ng-container>

          <ng-container matColumnDef="program">
            <th mat-header-cell *matHeaderCellDef>Program</th>
            <td mat-cell *matCellDef="let day">{{ day.workoutProgramName }}</td>
          </ng-container>

          <ng-container matColumnDef="uuid">
            <th mat-header-cell *matHeaderCellDef>UUID</th>
            <td mat-cell *matCellDef="let day" class="uuid">{{ day.uuid }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let day">
              <a mat-button [routerLink]="['/exercises']" [queryParams]="{ workoutDayUuid: day.uuid }">
                Exercises
              </a>
              <button mat-button color="warn" type="button" (click)="deleteDay(day)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && days().length === 0) {
        <p class="empty">Load a program to see its workout days.</p>
      }
    </mat-card>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 18px;
      margin-bottom: 18px;
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

    .uuid {
      max-width: 260px;
      font-family: Consolas, monospace;
      font-size: 0.82rem;
      word-break: break-all;
    }

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }
  `,
})
export class WorkoutDaysComponent implements OnInit {
  private readonly api = inject(WorkoutDaysApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = ['dayName', 'program', 'uuid', 'actions'];
  protected readonly days = signal<WorkoutDayReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly lookupForm = new FormGroup({
    workoutProgramUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly createForm = new FormGroup({
    dayName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    const programUuid = this.route.snapshot.queryParamMap.get('programUuid');
    if (programUuid) {
      this.lookupForm.controls.workoutProgramUuid.setValue(programUuid);
      this.loadDays();
    }
  }

  protected loadDays(): void {
    this.error.set('');
    this.lookupForm.markAllAsTouched();
    if (this.lookupForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.api.getByWorkoutProgram(this.lookupForm.controls.workoutProgramUuid.value).subscribe({
      next: (days) => {
        this.days.set(days);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.apiError.message(error));
        this.loading.set(false);
      },
    });
  }

  protected createDay(): void {
    this.formError = '';
    this.createForm.markAllAsTouched();
    this.lookupForm.markAllAsTouched();

    if (this.createForm.invalid || this.lookupForm.invalid) {
      return;
    }

    this.saving = true;
    this.api
      .create({
        dayName: this.createForm.controls.dayName.value,
        workoutProgramUuid: this.lookupForm.controls.workoutProgramUuid.value,
      })
      .subscribe({
        next: (day) => {
          this.days.update((days) => [day, ...days]);
          this.createForm.reset();
          this.saving = false;
          this.notification.success('Workout day created.');
        },
        error: (error: unknown) => {
          this.formError = this.apiError.message(error);
          this.saving = false;
        },
      });
  }

  protected deleteDay(day: WorkoutDayReadDto): void {
    const confirmed = window.confirm(`Delete ${day.dayName}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(day.uuid).subscribe({
      next: () => {
        this.days.update((days) => days.filter((entry) => entry.uuid !== day.uuid));
        this.notification.success('Workout day deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}
