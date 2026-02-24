import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

/**
 * Shows a toast for network errors (status 0) and server errors (5xx).
 * Does not show for 4xx so that components can show their own messages.
 */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error?.status ?? 0;
      const isNetworkError = status === 0;
      const isServerError = status >= 500;
      const isUnauthorized = status === 401;

      if (isUnauthorized) {
        // Auth interceptor / login flow handles this
      } else if (isNetworkError) {
        messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Network error',
          detail: 'Check your connection and try again.',
          life: 5000,
        });
      } else if (isServerError) {
        messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Server error',
          detail: error?.error?.message ?? 'Something went wrong. Please try again.',
          life: 5000,
        });
      }

      return throwError(() => error);
    }),
  );
};
