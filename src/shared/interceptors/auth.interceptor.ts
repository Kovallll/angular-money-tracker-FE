import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

const AUTH_PREFIX = '/auth/';
const isAuthRoute = (url: string) => url.includes(AUTH_PREFIX);

/** Общий refresh: при нескольких 401 подряд все ждут один refresh и повторяют запрос с новым токеном. */
let refresh$: Observable<{ accessToken: string } | null> | null = null;

function getOrStartRefresh(authService: AuthService): Observable<{ accessToken: string } | null> {
  if (!refresh$) {
    refresh$ = authService.refreshToken().pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      finalize(() => {
        refresh$ = null;
      }),
    );
  }
  return refresh$;
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (!isAuthRoute(req.url)) {
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    } else {
      console.warn(
        '[Auth] Запрос без токена:',
        req.url,
        '— войдите снова (localStorage.accessToken пуст или истёк сеанс)',
      );
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute(req.url)) {
        return getOrStartRefresh(authService).pipe(
          take(1),
          switchMap((tokens) => {
            if (!tokens) {
              authService.logout();
              return throwError(() => error);
            }
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
