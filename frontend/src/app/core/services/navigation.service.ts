import { Injectable } from '@angular/core';

import { Role } from '../models/api.models';

export interface NavigationItem {
  label: string;
  route: string;
  description: string;
  roles?: readonly Role[];
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  readonly items: readonly NavigationItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      description: 'Your platform overview.',
    },
    {
      label: 'Profile',
      route: '/profile',
      description: 'Account and password settings.',
    },
    {
      label: 'Users',
      route: '/users',
      description: 'Manage users and roles.',
      roles: ['ROLE_ADMIN', 'ROLE_COACH'],
    },
    {
      label: 'Workout Programs',
      route: '/workout-programs',
      description: 'Coach programs and assignments.',
      roles: ['ROLE_ADMIN', 'ROLE_COACH'],
    },
    {
      label: 'Workout Days',
      route: '/workout-days',
      description: 'Program day planning.',
    },
    {
      label: 'Exercises',
      route: '/exercises',
      description: 'Exercises inside workout days.',
    },
    {
      label: 'Nutrition Plans',
      route: '/nutrition-plans',
      description: 'Plans and assigned clients.',
    },
    {
      label: 'Meals',
      route: '/meals',
      description: 'Meals inside nutrition plans.',
    },
    {
      label: 'Progress',
      route: '/progress-entries',
      description: 'Your progress entries.',
    },
    {
      label: 'Messages',
      route: '/messages',
      description: 'Sent, received, and conversations.',
    },
  ];

  filterByRole(role: Role | undefined): readonly NavigationItem[] {
    return this.items.filter((item) => !item.roles || (!!role && item.roles.includes(role)));
  }
}
