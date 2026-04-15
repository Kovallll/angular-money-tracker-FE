import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '@/shared';
import { MessageService } from 'primeng/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  imports: [FormsModule, MatFormFieldModule, MatInputModule, AppButtonComponent, TranslateModule],
})
export class SecurityComponent {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private i18n = inject(I18nService);
  loading = signal(false);

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: this.i18n.t('settings.validation'),
        detail: this.i18n.t('settings.passwordMinLength'),
        life: 4000,
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: this.i18n.t('settings.validation'),
        detail: this.i18n.t('settings.passwordsDoNotMatch'),
        life: 4000,
      });
      return;
    }

    this.loading.set(true);
    try {
      await this.userService.changePassword(this.oldPassword, this.newPassword);
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('common.success'),
        detail: this.i18n.t('settings.passwordChanged'),
        life: 3000,
      });
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      form.resetForm();
    } catch (err: any) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail: err?.error?.message ?? this.i18n.t('settings.failedToChangePassword'),
        life: 5000,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
