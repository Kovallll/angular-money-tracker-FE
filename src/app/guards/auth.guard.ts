import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@/shared/services/auth/auth.service';
import { RoutePaths } from '@/shared';

/** Защищает приватные маршруты — редирект на логин при отсутствии авторизации. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([RoutePaths.LOGIN]);
};
