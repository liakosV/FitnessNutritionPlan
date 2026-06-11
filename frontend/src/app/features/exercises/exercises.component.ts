import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { ExercisesApiService } from '../../core/api/exercises-api.service';
import { WorkoutDaysApiService } from '../../core/api/workout-days-api.service';
import { WorkoutProgramsApiService } from '../../core/api/workout-programs-api.service';
import { ExerciseReadDto, WorkoutDayReadDto, WorkoutProgramReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-exercises',
  imports: [
    FormErrorComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
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
  private readonly daysApi = inject(WorkoutDaysApiService);
  private readonly notification = inject(NotificationService);
  private readonly programsApi = inject(WorkoutProgramsApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = ['name', 'sets', 'reps', 'restTime', 'uuid', 'actions'];
  protected readonly exercises = signal<ExerciseReadDto[]>([]);
  protected readonly programs = signal<WorkoutProgramReadDto[]>([]);
  protected readonly workoutDays = signal<WorkoutDayReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly workoutProgramSearch = new FormControl('', { nonNullable: true });
  protected readonly workoutProgramQuery = signal('');
  protected readonly selectedWorkoutProgram = signal<WorkoutProgramReadDto | null>(null);
  protected readonly filteredPrograms = computed(() => {
    const query = this.workoutProgramQuery().trim().toLowerCase();

    if (!query) {
      return this.programs();
    }

    return this.programs().filter((program) => this.programSearchText(program).includes(query));
  });
  protected readonly workoutDaySearch = new FormControl('', { nonNullable: true });
  protected readonly workoutDayQuery = signal('');
  protected readonly selectedWorkoutDay = signal<WorkoutDayReadDto | null>(null);
  protected readonly filteredWorkoutDays = computed(() => {
    const query = this.workoutDayQuery().trim().toLowerCase();

    if (!query) {
      return this.workoutDays();
    }

    return this.workoutDays().filter((day) => this.daySearchText(day).includes(query));
  });
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
    this.loadPrograms();

    this.workoutProgramSearch.valueChanges.subscribe((query) => {
      this.workoutProgramQuery.set(query);

      const selected = this.selectedWorkoutProgram();
      if (selected && query !== this.programLabel(selected)) {
        this.selectedWorkoutProgram.set(null);
        this.workoutDays.set([]);
        this.clearWorkoutDaySelection();
      }
    });

    this.workoutDaySearch.valueChanges.subscribe((query) => {
      this.workoutDayQuery.set(query);

      const selected = this.selectedWorkoutDay();
      if (selected && query !== this.dayLabel(selected)) {
        this.clearWorkoutDaySelection();
      }
    });
  }

  protected selectWorkoutProgram(programUuid: string): void {
    this.applyWorkoutProgramUuid(programUuid);
  }

  protected selectWorkoutDay(workoutDayUuid: string): void {
    this.applyWorkoutDayUuid(workoutDayUuid, false);
  }

  protected loadPrograms(): void {
    this.programsApi.getAccessible().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.applyRouteLookup();
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected programLabel(program: WorkoutProgramReadDto): string {
    return `${program.name} (${program.coachUsername})`;
  }

  protected dayLabel(day: WorkoutDayReadDto): string {
    return `${day.dayName} (${day.workoutProgramName})`;
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

  private applyRouteLookup(): void {
    const programUuid = this.route.snapshot.queryParamMap.get('programUuid');
    const workoutDayUuid = this.route.snapshot.queryParamMap.get('workoutDayUuid');

    if (programUuid) {
      this.applyWorkoutProgramUuid(programUuid, workoutDayUuid ?? undefined);
      return;
    }

    if (workoutDayUuid) {
      this.lookupForm.controls.workoutDayUuid.setValue(workoutDayUuid);
      this.workoutDaySearch.setValue(workoutDayUuid, { emitEvent: false });
      this.workoutDayQuery.set(workoutDayUuid);
      this.loadExercises();
    }
  }

  private applyWorkoutProgramUuid(programUuid: string, routeWorkoutDayUuid?: string): void {
    const program = this.programs().find((entry) => entry.uuid === programUuid);

    if (program) {
      this.selectedWorkoutProgram.set(program);
      this.workoutProgramSearch.setValue(this.programLabel(program), { emitEvent: false });
      this.workoutProgramQuery.set(this.programLabel(program));
    } else {
      this.selectedWorkoutProgram.set(null);
      this.workoutProgramSearch.setValue(programUuid, { emitEvent: false });
      this.workoutProgramQuery.set(programUuid);
    }

    this.clearWorkoutDaySelection();
    this.daysApi.getByWorkoutProgram(programUuid).subscribe({
      next: (days) => {
        this.workoutDays.set(days);

        if (routeWorkoutDayUuid) {
          this.applyWorkoutDayUuid(routeWorkoutDayUuid, true);
        }
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  private applyWorkoutDayUuid(workoutDayUuid: string, loadExercises: boolean): void {
    const day = this.workoutDays().find((entry) => entry.uuid === workoutDayUuid);
    this.lookupForm.controls.workoutDayUuid.setValue(workoutDayUuid);

    if (day) {
      this.selectedWorkoutDay.set(day);
      this.workoutDaySearch.setValue(this.dayLabel(day), { emitEvent: false });
      this.workoutDayQuery.set(this.dayLabel(day));
    } else {
      this.selectedWorkoutDay.set(null);
      this.workoutDaySearch.setValue(workoutDayUuid, { emitEvent: false });
      this.workoutDayQuery.set(workoutDayUuid);
    }

    if (loadExercises) {
      this.loadExercises();
    }
  }

  private clearWorkoutDaySelection(): void {
    this.selectedWorkoutDay.set(null);
    this.lookupForm.controls.workoutDayUuid.setValue('');
    this.workoutDaySearch.setValue('', { emitEvent: false });
    this.workoutDayQuery.set('');
  }

  private programSearchText(program: WorkoutProgramReadDto): string {
    return `${program.name} ${program.description} ${program.coachUsername} ${program.uuid}`.toLowerCase();
  }

  private daySearchText(day: WorkoutDayReadDto): string {
    return `${day.dayName} ${day.workoutProgramName} ${day.uuid}`.toLowerCase();
  }
}
