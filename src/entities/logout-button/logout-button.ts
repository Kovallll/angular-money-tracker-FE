import { Component, inject, input } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/shared/services/auth/auth.service';
import { ConfirmationService } from 'primeng/api';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'logout-button',
  imports: [AppButtonComponent, RouterModule, AppIconComponent, TranslateModule],
  templateUrl: './logout-button.html',
  styleUrls: ['./logout-button.scss'],
  host: {
    '[class.logout-icon-only]': 'iconOnly()',
  },
})
export class LogoutButtonComponent {
  /** Только иконка (например, в сайдбаре в строке профиля). */
  iconOnly = input(false);

  private router = inject(Router);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private i18n = inject(I18nService);

  logout() {
    this.confirmationService.confirm({
      message: this.i18n.t('settings.signOutConfirm'),
      header: this.i18n.t('settings.signOut'),
      icon: 'pi pi-sign-out',
      acceptLabel: this.i18n.t('settings.signOut'),
      rejectLabel: this.i18n.t('balances.cancel'),
      accept: () => this.doLogout(),
    });
  }

  private async doLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
