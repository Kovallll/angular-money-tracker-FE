import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@/shared/services/auth/auth.service';
import { RoutePaths } from '@/shared';

/** Для публичных маршрутов (логин, регистрация) — редирект на дашборд, если уже авторизован. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([RoutePaths.DASHBOARD]);
};
