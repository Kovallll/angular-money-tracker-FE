import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

const AUTH_PREFIX = '/auth/';
const isAuthRoute = (url: string) => url.includes(AUTH_PREFIX);

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && !isAuthRoute(req.url)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute(req.url)) {
        if (!isRefreshing) {
          isRefreshing = true;

          return authService.refreshToken().pipe(
            switchMap((tokens) => {
              isRefreshing = false;

              if (!tokens) {
                authService.logout();
                return throwError(() => error);
              }

              // Повторяем запрос с новым токеном
              req = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
              });
              return next(req);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
