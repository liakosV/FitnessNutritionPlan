import { Routes } from '@angular/router';

import { authChildGuard, authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COACH'] },
        loadComponent: () =>
          import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'workout-programs',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COACH'] },
        loadComponent: () =>
          import('./features/workout-programs/workout-programs.component').then(
            (m) => m.WorkoutProgramsComponent,
          ),
      },
      {
        path: 'workout-days',
        loadComponent: () =>
          import('./features/workout-days/workout-days.component').then(
            (m) => m.WorkoutDaysComponent,
          ),
      },
      {
        path: 'exercises',
        loadComponent: () =>
          import('./features/exercises/exercises.component').then((m) => m.ExercisesComponent),
      },
      {
        path: 'nutrition-plans',
        loadComponent: () =>
          import('./features/nutrition-plans/nutrition-plans.component').then(
            (m) => m.NutritionPlansComponent,
          ),
      },
      {
        path: 'meals',
        loadComponent: () =>
          import('./features/meals/meals.component').then((m) => m.MealsComponent),
      },
      {
        path: 'progress-entries',
        loadComponent: () =>
          import('./features/progress-entries/progress-entries.component').then(
            (m) => m.ProgressEntriesComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/messages/messages.component').then((m) => m.MessagesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
