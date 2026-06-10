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
  templateUrl: './workout-days.component.html',
  styleUrl: './workout-days.component.css',
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
