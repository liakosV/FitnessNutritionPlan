import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Role } from '../models/api.models';

export const authGuard: CanActivateFn = (_route, state) => checkAuthenticated(state);

export const authChildGuard: CanActivateChildFn = (_route, state) => checkAuthenticated(state);

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = checkAuthenticated(state);

  if (authenticated !== true) {
    return authenticated;
  }

  const roles = routeRoles(route);
  return auth.hasAnyRole(roles) ? true : router.createUrlTree(['/dashboard']);
};

function checkAuthenticated(state: RouterStateSnapshot) {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
}

export function routeRoles(route: ActivatedRouteSnapshot): Role[] | undefined {
  return route.data['roles'] as Role[] | undefined;
}
