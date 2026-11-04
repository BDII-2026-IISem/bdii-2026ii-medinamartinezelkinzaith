import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE, Auth } from '../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const isApi = req.url.startsWith(API_BASE);
  const isAuthUrl = req.url.includes('/api/auth/');
  if (!isApi || isAuthUrl) return next(req);

  const withToken = (r: HttpRequest<unknown>) => {
    const t = auth.accessToken;
    return t ? r.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : r;
  };

  const toLogin = () => {
    auth.clear();
    router.navigate(['/login']);
  };

  return next(withToken(req)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);
      if (!auth.refreshToken) {
        toLogin();
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        catchError((e) => {
          toLogin();
          return throwError(() => e);
        }),
        switchMap(() => next(withToken(req)))
      );
    })
  );
};
