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
import { NutritionPlansApiService } from '../../core/api/nutrition-plans-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { NutritionPlanReadDto, UserReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusPillComponent } from '../../shared/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-nutrition-plans',
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
  templateUrl: './nutrition-plans.component.html',
  styleUrl: './nutrition-plans.component.css',
})
export class NutritionPlansComponent implements OnInit {
  private readonly api = inject(NutritionPlansApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly usersApi = inject(UsersApiService);

  protected readonly columns = ['title', 'coach', 'assigned', 'active', 'actions'];
  protected readonly plans = signal<NutritionPlanReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly users = signal<UserReadDto[]>([]);
  protected readonly assignedUserSearch = new FormControl('', { nonNullable: true });
  protected readonly assignedUserQuery = signal('');
  protected readonly selectedAssignedUser = signal<UserReadDto | null>(null);
  protected readonly lookupPlanSearch = new FormControl('', { nonNullable: true });
  protected readonly lookupPlanQuery = signal('');
  protected readonly selectedLookupPlan = signal<NutritionPlanReadDto | null>(null);
  protected readonly filteredUsers = computed(() => {
    const query = this.assignedUserQuery().trim().toLowerCase();
    const clientUsers = this.users().filter((user) => user.role === 'ROLE_USER');

    if (!query) {
      return clientUsers;
    }

    return clientUsers.filter((user) =>
      `${user.username} ${user.email} ${user.uuid}`.toLowerCase().includes(query),
    );
  });
  protected readonly filteredLookupPlans = computed(() => {
    const query = this.lookupPlanQuery().trim().toLowerCase();

    if (!query) {
      return this.plans();
    }

    return this.plans().filter((plan) => this.planSearchText(plan).includes(query));
  });
  protected readonly createForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    active: new FormControl(true, { nonNullable: true }),
    assignedUserUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly lookupForm = new FormGroup({
    uuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected saving = false;
  protected formError = '';
  protected lookupError = '';

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();
    this.loadAccessiblePlans();

    if (currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_COACH') {
      this.loadUsers();
    }

    this.assignedUserSearch.valueChanges.subscribe((query) => {
      this.assignedUserQuery.set(query);

      const selected = this.selectedAssignedUser();
      if (selected && query !== this.userLabel(selected)) {
        this.selectedAssignedUser.set(null);
        this.createForm.controls.assignedUserUuid.setValue('');
      }
    });

    this.lookupPlanSearch.valueChanges.subscribe((query) => {
      this.lookupPlanQuery.set(query);

      const selected = this.selectedLookupPlan();
      if (selected && query !== this.planLabel(selected)) {
        this.selectedLookupPlan.set(null);
        this.lookupForm.controls.uuid.setValue('');
      }
    });
  }

  protected selectAssignedUser(userUuid: string): void {
    const user = this.users().find((entry) => entry.uuid === userUuid);
    if (!user) {
      return;
    }

    this.selectedAssignedUser.set(user);
    this.createForm.controls.assignedUserUuid.setValue(user.uuid);
    this.assignedUserSearch.setValue(this.userLabel(user));
  }

  protected selectLookupPlan(planUuid: string): void {
    const plan = this.plans().find((entry) => entry.uuid === planUuid);
    if (!plan) {
      return;
    }

    this.selectedLookupPlan.set(plan);
    this.lookupForm.controls.uuid.setValue(plan.uuid);
    this.lookupPlanSearch.setValue(this.planLabel(plan));
  }

  protected planLabel(plan: NutritionPlanReadDto): string {
    return `${plan.title} (${plan.assignedUserUsername})`;
  }

  protected loadAccessiblePlans(): void {
    this.loading.set(true);
    this.api.getAccessible().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notification.error(this.apiError.message(error));
      },
    });
  }

  protected loadUsers(): void {
    this.usersApi.getAll().subscribe({
      next: (users) => this.users.set(users),
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected lookupPlan(): void {
    this.lookupError = '';
    this.lookupForm.markAllAsTouched();
    if (this.lookupForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.api.getByUuid(this.lookupForm.controls.uuid.value).subscribe({
      next: (plan) => {
        this.plans.update((plans) => [plan, ...plans.filter((entry) => entry.uuid !== plan.uuid)]);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.lookupError = this.apiError.message(error);
        this.loading.set(false);
      },
    });
  }

  protected createPlan(): void {
    this.formError = '';
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      return;
    }

    this.saving = true;
    this.api.create(this.createForm.getRawValue()).subscribe({
      next: (plan) => {
        this.plans.update((plans) => [plan, ...plans]);
        this.createForm.reset({ title: '', description: '', active: true, assignedUserUuid: '' });
        this.selectedAssignedUser.set(null);
        this.assignedUserSearch.reset('');
        this.saving = false;
        this.notification.success('Nutrition plan created.');
      },
      error: (error: unknown) => {
        this.formError = this.apiError.message(error);
        this.saving = false;
      },
    });
  }

  protected toggleActive(plan: NutritionPlanReadDto): void {
    this.api.update(plan.uuid, { active: !plan.active }).subscribe({
      next: (updated) => {
        this.plans.update((plans) => plans.map((entry) => (entry.uuid === updated.uuid ? updated : entry)));
        this.notification.success('Nutrition plan updated.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  protected deletePlan(plan: NutritionPlanReadDto): void {
    const confirmed = window.confirm(`Delete ${plan.title}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(plan.uuid).subscribe({
      next: () => {
        this.plans.update((plans) => plans.filter((entry) => entry.uuid !== plan.uuid));
        this.notification.success('Nutrition plan deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }

  private userLabel(user: UserReadDto): string {
    return `${user.username} (${user.email})`;
  }

  private planSearchText(plan: NutritionPlanReadDto): string {
    return `${plan.title} ${plan.description} ${plan.coachUsername} ${plan.assignedUserUsername} ${plan.uuid}`.toLowerCase();
  }
}
