import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { ExercisesApiService } from '../../core/api/exercises-api.service';
import { ExerciseReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-exercises',
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
  ],
  template: `
    <app-page-header
      title="Exercises"
      description="Loads and creates exercises through the nested /api/workout/days/:workoutDayUuid/exercises backend routes."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Workout day lookup</mat-card-title>
          <mat-card-subtitle>Paste a workout day UUID.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="lookupForm" (ngSubmit)="loadExercises()">
            <app-form-error [message]="error()" />
            <mat-form-field appearance="outline">
              <mat-label>Workout day UUID</mat-label>
              <input matInput formControlName="workoutDayUuid" />
            </mat-form-field>
            <button mat-flat-button type="submit">Load exercises</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Create exercise</mat-card-title>
          <mat-card-subtitle>Sets, reps, and rest time must be at least 1.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="createExercise()">
            <app-form-error [message]="formError" />
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <div class="numbers">
              <mat-form-field appearance="outline">
                <mat-label>Sets</mat-label>
                <input matInput type="number" min="1" formControlName="sets" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reps</mat-label>
                <input matInput type="number" min="1" formControlName="reps" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Rest time</mat-label>
                <input matInput type="number" min="1" formControlName="restTime" />
              </mat-form-field>
            </div>
            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create exercise' }}
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
        <table mat-table [dataSource]="exercises()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let exercise">{{ exercise.name }}</td>
          </ng-container>
          <ng-container matColumnDef="sets">
            <th mat-header-cell *matHeaderCellDef>Sets</th>
            <td mat-cell *matCellDef="let exercise">{{ exercise.sets }}</td>
          </ng-container>
          <ng-container matColumnDef="reps">
            <th mat-header-cell *matHeaderCellDef>Reps</th>
            <td mat-cell *matCellDef="let exercise">{{ exercise.reps }}</td>
          </ng-container>
          <ng-container matColumnDef="restTime">
            <th mat-header-cell *matHeaderCellDef>Rest</th>
            <td mat-cell *matCellDef="let exercise">{{ exercise.restTime }}</td>
          </ng-container>
          <ng-container matColumnDef="uuid">
            <th mat-header-cell *matHeaderCellDef>UUID</th>
            <td mat-cell *matCellDef="let exercise" class="uuid">{{ exercise.uuid }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let exercise">
              <button mat-button color="warn" type="button" (click)="deleteExercise(exercise)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && exercises().length === 0) {
        <p class="empty">Load a workout day to see exercises.</p>
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

    .numbers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
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

    @media (max-width: 760px) {
      .numbers {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ExercisesComponent implements OnInit {
  private readonly api = inject(ExercisesApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = ['name', 'sets', 'reps', 'restTime', 'uuid', 'actions'];
  protected readonly exercises = signal<ExerciseReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly lookupForm = new FormGroup({
    workoutDayUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly createForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sets: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    reps: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    restTime: new FormControl(60, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    const workoutDayUuid = this.route.snapshot.queryParamMap.get('workoutDayUuid');
    if (workoutDayUuid) {
      this.lookupForm.controls.workoutDayUuid.setValue(workoutDayUuid);
      this.loadExercises();
    }
  }

  protected loadExercises(): void {
    this.error.set('');
    this.lookupForm.markAllAsTouched();
    if (this.lookupForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.api.getByWorkoutDay(this.lookupForm.controls.workoutDayUuid.value).subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.apiError.message(error));
        this.loading.set(false);
      },
    });
  }

  protected createExercise(): void {
    this.formError = '';
    this.createForm.markAllAsTouched();
    this.lookupForm.markAllAsTouched();

    if (this.createForm.invalid || this.lookupForm.invalid) {
      return;
    }

    this.saving = true;
    this.api.create(this.lookupForm.controls.workoutDayUuid.value, this.createForm.getRawValue()).subscribe({
      next: (exercise) => {
        this.exercises.update((exercises) => [exercise, ...exercises]);
        this.createForm.reset({ name: '', sets: 1, reps: 1, restTime: 60 });
        this.saving = false;
        this.notification.success('Exercise created.');
      },
      error: (error: unknown) => {
        this.formError = this.apiError.message(error);
        this.saving = false;
      },
    });
  }

  protected deleteExercise(exercise: ExerciseReadDto): void {
    const confirmed = window.confirm(`Delete ${exercise.name}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(exercise.uuid).subscribe({
      next: () => {
        this.exercises.update((exercises) =>
          exercises.filter((entry) => entry.uuid !== exercise.uuid),
        );
        this.notification.success('Exercise deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}
