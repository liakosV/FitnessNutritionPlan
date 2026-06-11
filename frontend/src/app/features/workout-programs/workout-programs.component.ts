import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { ApiErrorService } from '../../core/api/api-error.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { WorkoutProgramsApiService } from '../../core/api/workout-programs-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserReadDto, WorkoutProgramReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusPillComponent } from '../../shared/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-workout-programs',
  imports: [
    FormErrorComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
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
  private readonly usersApi = inject(UsersApiService);

  protected readonly columns = ['name', 'coach', 'assigned', 'active', 'actions'];
  protected readonly programs = signal<WorkoutProgramReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly users = signal<UserReadDto[]>([]);
  protected readonly assignedUserSearch = new FormControl('', { nonNullable: true });
  protected readonly assignedUserQuery = signal('');
  protected readonly selectedAssignedUsers = signal<UserReadDto[]>([]);
  protected readonly filteredAssignedUsers = computed(() => {
    const query = this.assignedUserQuery().trim().toLowerCase();
    const selectedUuids = new Set(this.selectedAssignedUsers().map((user) => user.uuid));
    const clientUsers = this.users().filter(
      (user) => user.role === 'ROLE_USER' && !selectedUuids.has(user.uuid),
    );

    if (!query) {
      return clientUsers;
    }

    return clientUsers.filter((user) => this.userSearchText(user).includes(query));
  });
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    this.loadPrograms();
    this.loadUsers();

    this.assignedUserSearch.valueChanges.subscribe((query) => {
      this.assignedUserQuery.set(query);
    });
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
        assignedUserUuids: this.selectedAssignedUsers().map((user) => user.uuid),
      })
      .subscribe({
        next: (program) => {
          this.programs.update((programs) => [program, ...programs]);
          this.form.reset();
          this.selectedAssignedUsers.set([]);
          this.assignedUserSearch.reset('');
          this.saving = false;
          this.notification.success('Workout program created.');
        },
        error: (error: unknown) => {
          this.formError = this.apiError.message(error);
          this.saving = false;
        },
      });
  }

  protected selectAssignedUser(userUuid: string): void {
    const user = this.users().find((entry) => entry.uuid === userUuid);
    if (!user) {
      return;
    }

    this.selectedAssignedUsers.update((selected) =>
      selected.some((entry) => entry.uuid === user.uuid) ? selected : [...selected, user],
    );
    this.assignedUserSearch.reset('');
  }

  protected removeAssignedUser(userUuid: string): void {
    this.selectedAssignedUsers.update((users) => users.filter((user) => user.uuid !== userUuid));
  }

  protected userLabel(user: UserReadDto): string {
    return `${user.username} (${user.email})`;
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

  private loadUsers(): void {
    this.usersApi.getAll().subscribe({
      next: (users) => this.users.set(users),
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  private userSearchText(user: UserReadDto): string {
    return `${user.username} ${user.email} ${user.uuid}`.toLowerCase();
  }
}
