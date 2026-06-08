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
  template: `
    <app-page-header
      title="Nutrition Plans"
      description="Creates plans through /api/nutrition-plans; admins can list all, other roles can use UUID lookup."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Create plan</mat-card-title>
          <mat-card-subtitle>Assigned user must be a client account.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="createPlan()">
            <app-form-error [message]="formError" />
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Assigned user UUID</mat-label>
              <input matInput formControlName="assignedUserUuid" />
            </mat-form-field>
            <mat-checkbox formControlName="active">Active</mat-checkbox>
            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create plan' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Plan lookup</mat-card-title>
          <mat-card-subtitle>Works for admins, owning coaches, and assigned clients.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="lookupForm" (ngSubmit)="lookupPlan()">
            <app-form-error [message]="lookupError" />
            <mat-form-field appearance="outline">
              <mat-label>Nutrition plan UUID</mat-label>
              <input matInput formControlName="uuid" />
            </mat-form-field>
            <button mat-flat-button type="submit">Find plan</button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>

    <mat-card appearance="outlined" class="list-card">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <div class="table-wrap">
        <table mat-table [dataSource]="plans()">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Plan</th>
            <td mat-cell *matCellDef="let plan">
              <strong>{{ plan.title }}</strong>
              <span>{{ plan.description }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="coach">
            <th mat-header-cell *matHeaderCellDef>Coach</th>
            <td mat-cell *matCellDef="let plan">{{ plan.coachUsername }}</td>
          </ng-container>

          <ng-container matColumnDef="assigned">
            <th mat-header-cell *matHeaderCellDef>Assigned</th>
            <td mat-cell *matCellDef="let plan">{{ plan.assignedUserUsername }}</td>
          </ng-container>

          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let plan"><app-status-pill [active]="plan.active" /></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let plan">
              <a mat-button [routerLink]="['/meals']" [queryParams]="{ nutritionPlanUuid: plan.uuid }">
                Meals
              </a>
              <button mat-button type="button" (click)="toggleActive(plan)">
                {{ plan.active ? 'Deactivate' : 'Activate' }}
              </button>
              <button mat-button color="warn" type="button" (click)="deletePlan(plan)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && plans().length === 0) {
        <p class="empty">No nutrition plans loaded yet.</p>
      }
    </mat-card>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

    td strong,
    td span {
      display: block;
    }

    td span {
      max-width: 320px;
      color: #526b62;
    }

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }
  `,
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
