import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = localStorage.getItem('accessToken');

  const isAuthRequest = req.url.includes('/api/auth/');

  const authReq = accessToken && !isAuthRequest
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    : req;

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || isAuthRequest) {
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap((res) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              }
            });

            return next(retryReq);
          })
        );
      })
    );
};
