import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NutritionPlansApiService } from '../../core/api/nutrition-plans-api.service';
import { ProgressEntriesApiService } from '../../core/api/progress-entries-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { WorkoutProgramsApiService } from '../../core/api/workout-programs-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

interface DashboardCard {
  label: string;
  value: string;
  helper: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatProgressBarModule, PageHeaderComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly nutritionPlansApi = inject(NutritionPlansApiService);
  private readonly progressEntriesApi = inject(ProgressEntriesApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly workoutProgramsApi = inject(WorkoutProgramsApiService);

  protected readonly loading = signal(false);
  protected readonly cards = signal<DashboardCard[]>([]);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    const canSeeUsers = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_COACH';
    const canSeePrograms = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_COACH';

    this.loading.set(true);
    forkJoin({
      users: canSeeUsers
        ? this.usersApi.getAll().pipe(catchError(() => of([])))
        : of([]),
      workoutPrograms: this.workoutProgramsApi.getAccessible().pipe(catchError(() => of([]))),
      nutritionPlans: this.nutritionPlansApi.getAccessible().pipe(catchError(() => of([]))),
      progressEntries: this.progressEntriesApi.getMine().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ users, workoutPrograms, nutritionPlans, progressEntries }) => {
        this.cards.set([
          {
            label: 'Users',
            value: canSeeUsers ? String(users.length) : 'Role scoped',
            helper: canSeeUsers ? 'Users available to your role.' : 'User list is admin/coach only.',
            route: canSeeUsers ? '/users' : '/profile',
          },
          {
            label: 'Workout Programs',
            value: String(workoutPrograms.length),
            helper: canSeePrograms
              ? 'Programs returned by the backend for your role.'
              : 'Programs assigned to your account.',
            route: canSeePrograms ? '/workout-programs' : '/workout-days',
          },
          {
            label: 'Nutrition Plans',
            value: String(nutritionPlans.length),
            helper: 'Nutrition plans you can access.',
            route: '/nutrition-plans',
          },
          {
            label: 'Progress Entries',
            value: String(progressEntries.length),
            helper: 'Your personal progress records.',
            route: '/progress-entries',
          },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
