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
  templateUrl: './meals.component.html',
  styleUrl: './meals.component.css',
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
