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
import { MealsApiService } from '../../core/api/meals-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { MealReadDto } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/notification.service';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-meals',
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
      title="Meals"
      description="Admin can list all meals; all allowed roles can load meals by nutrition plan UUID."
    />

    <section class="grid">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Nutrition plan lookup</mat-card-title>
          <mat-card-subtitle>Uses /api/nutrition-plans/:nutritionPlanUuid/meals.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="lookupForm" (ngSubmit)="loadMealsByPlan()">
            <app-form-error [message]="error()" />
            <mat-form-field appearance="outline">
              <mat-label>Nutrition plan UUID</mat-label>
              <input matInput formControlName="nutritionPlanUuid" />
            </mat-form-field>
            <button mat-flat-button type="submit">Load meals</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Create meal</mat-card-title>
          <mat-card-subtitle>Calories and macros map directly to MealInsertDto.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="createForm" (ngSubmit)="createMeal()">
            <app-form-error [message]="formError" />
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <div class="numbers">
              <mat-form-field appearance="outline">
                <mat-label>Calories</mat-label>
                <input matInput type="number" min="0" formControlName="calories" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Protein</mat-label>
                <input matInput type="number" min="0" formControlName="protein" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Carbs</mat-label>
                <input matInput type="number" min="0" formControlName="carbs" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Fat</mat-label>
                <input matInput type="number" min="0" formControlName="fat" />
              </mat-form-field>
            </div>
            <button mat-flat-button type="submit" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create meal' }}
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
        <table mat-table [dataSource]="meals()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let meal">{{ meal.name }}</td>
          </ng-container>
          <ng-container matColumnDef="calories">
            <th mat-header-cell *matHeaderCellDef>Calories</th>
            <td mat-cell *matCellDef="let meal">{{ meal.calories }}</td>
          </ng-container>
          <ng-container matColumnDef="protein">
            <th mat-header-cell *matHeaderCellDef>Protein</th>
            <td mat-cell *matCellDef="let meal">{{ meal.protein }}</td>
          </ng-container>
          <ng-container matColumnDef="carbs">
            <th mat-header-cell *matHeaderCellDef>Carbs</th>
            <td mat-cell *matCellDef="let meal">{{ meal.carbs }}</td>
          </ng-container>
          <ng-container matColumnDef="fat">
            <th mat-header-cell *matHeaderCellDef>Fat</th>
            <td mat-cell *matCellDef="let meal">{{ meal.fat }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let meal">
              <button mat-button color="warn" type="button" (click)="deleteMeal(meal)">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && meals().length === 0) {
        <p class="empty">Load a nutrition plan to see meals.</p>
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

    .numbers {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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

    .empty {
      margin: 0;
      color: #526b62;
      padding: 22px;
    }

    @media (max-width: 640px) {
      .numbers {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class MealsComponent implements OnInit {
  private readonly api = inject(MealsApiService);
  private readonly apiError = inject(ApiErrorService);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  protected readonly columns = ['name', 'calories', 'protein', 'carbs', 'fat', 'actions'];
  protected readonly meals = signal<MealReadDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly lookupForm = new FormGroup({
    nutritionPlanUuid: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly createForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    calories: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    protein: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    carbs: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    fat: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  });

  protected saving = false;
  protected formError = '';

  ngOnInit(): void {
    const nutritionPlanUuid = this.route.snapshot.queryParamMap.get('nutritionPlanUuid');
    if (nutritionPlanUuid) {
      this.lookupForm.controls.nutritionPlanUuid.setValue(nutritionPlanUuid);
      this.loadMealsByPlan();
      return;
    }

    if (this.auth.currentUser()?.role === 'ROLE_ADMIN') {
      this.loadAll();
    }
  }

  protected loadAll(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (meals) => {
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.apiError.message(error));
      },
    });
  }

  protected loadMealsByPlan(): void {
    this.error.set('');
    this.lookupForm.markAllAsTouched();
    if (this.lookupForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.api.getByNutritionPlan(this.lookupForm.controls.nutritionPlanUuid.value).subscribe({
      next: (meals) => {
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.apiError.message(error));
      },
    });
  }

  protected createMeal(): void {
    this.formError = '';
    this.createForm.markAllAsTouched();
    this.lookupForm.markAllAsTouched();

    if (this.createForm.invalid || this.lookupForm.invalid) {
      return;
    }

    this.saving = true;
    this.api.create(this.lookupForm.controls.nutritionPlanUuid.value, this.createForm.getRawValue()).subscribe({
      next: (meal) => {
        this.meals.update((meals) => [meal, ...meals]);
        this.createForm.reset({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
        this.saving = false;
        this.notification.success('Meal created.');
      },
      error: (error: unknown) => {
        this.formError = this.apiError.message(error);
        this.saving = false;
      },
    });
  }

  protected deleteMeal(meal: MealReadDto): void {
    const confirmed = window.confirm(`Delete ${meal.name}?`);
    if (!confirmed) {
      return;
    }

    this.api.delete(meal.uuid).subscribe({
      next: () => {
        this.meals.update((meals) => meals.filter((entry) => entry.uuid !== meal.uuid));
        this.notification.success('Meal deleted.');
      },
      error: (error: unknown) => this.notification.error(this.apiError.message(error)),
    });
  }
}
