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
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css',
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
