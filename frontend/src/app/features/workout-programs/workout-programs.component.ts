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
  templateUrl: './workout-programs.component.html',
  styleUrl: './workout-programs.component.css',
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
