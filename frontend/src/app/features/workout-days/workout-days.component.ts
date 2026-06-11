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
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { WorkoutDaysApiService } from '../../core/api/workout-days-api.service';
import { WorkoutProgramsApiService } from '../../core/api/workout-programs-api.service';
import { WorkoutDayReadDto, WorkoutProgramReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-workout-days',
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
    RouterLink,
  ],
  templateUrl: './workout-days.component.html',
  styleUrl: './workout-days.component.css',
})
export class WorkoutDaysComponent implements OnInit {
  private readonly api = inject(WorkoutDaysApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notification = inject(NotificationService);
  private readonly programsApi = inject(WorkoutProgramsApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = ['dayName', 'program', 'uuid', 'actions'];
  protected readonly days = signal<WorkoutDayReadDto[]>([]);
  protected readonly programs = signal<WorkoutProgramReadDto[]>([]);
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
  protected readonly lookupForm = new FormGroup({
    workoutProgramUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly createForm = new FormGroup({
    dayName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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
        this.lookupForm.controls.workoutProgramUuid.setValue('');
      }
    });
  }

  protected selectWorkoutProgram(programUuid: string): void {
    this.applyWorkoutProgramUuid(programUuid, false);
  }

  protected loadPrograms(): void {
    this.programsApi.getAccessible().subscribe({
      next: (programs) => {
        this.programs.set(programs);

        const programUuid = this.route.snapshot.queryParamMap.get('programUuid');
        if (programUuid) {
          this.applyWorkoutProgramUuid(programUuid, true);
        }
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected programLabel(program: WorkoutProgramReadDto): string {
    return `${program.name} (${program.coachUsername})`;
  }

  private applyWorkoutProgramUuid(programUuid: string, loadDays: boolean): void {
    const program = this.programs().find((entry) => entry.uuid === programUuid);
    this.lookupForm.controls.workoutProgramUuid.setValue(programUuid);

    if (program) {
      this.selectedWorkoutProgram.set(program);
      this.workoutProgramSearch.setValue(this.programLabel(program), { emitEvent: false });
      this.workoutProgramQuery.set(this.programLabel(program));
    } else {
      this.selectedWorkoutProgram.set(null);
      this.workoutProgramSearch.setValue(programUuid, { emitEvent: false });
      this.workoutProgramQuery.set(programUuid);
    }

    if (loadDays) {
      this.loadDays();
    }
  }

  private programSearchText(program: WorkoutProgramReadDto): string {
    return `${program.name} ${program.description} ${program.coachUsername} ${program.uuid}`.toLowerCase();
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
