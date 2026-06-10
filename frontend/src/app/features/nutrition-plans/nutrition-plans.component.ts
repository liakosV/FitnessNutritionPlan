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
import { NutritionPlansApiService } from '../../core/api/nutrition-plans-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { NutritionPlanReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusPillComponent } from '../../shared/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-nutrition-plans',
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
  templateUrl: './nutrition-plans.component.html',
  styleUrl: './nutrition-plans.component.css',
})
export class NutritionPlansComponent implements OnInit {
  private readonly api = inject(NutritionPlansApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);

  protected readonly columns = ['title', 'coach', 'assigned', 'active', 'actions'];
  protected readonly plans = signal<NutritionPlanReadDto[]>([]);
  protected readonly loading = signal(false);
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
    if (this.auth.currentUser()?.role === 'ROLE_ADMIN') {
      this.loadAll();
    }
  }

  protected loadAll(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
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
}
