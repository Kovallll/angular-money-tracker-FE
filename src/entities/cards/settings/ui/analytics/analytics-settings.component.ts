import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@/shared';
import { User } from '@/shared/types';
import { MessageService } from 'primeng/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

export type PeriodicityOption = 'week' | 'month' | 'quarter';

@Component({
  selector: 'settings-analytics',
  templateUrl: './analytics-settings.component.html',
  styleUrls: ['./analytics-settings.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslateModule,
  ],
})
export class AnalyticsSettingsComponent {
  user = input<User | null>(null);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private i18n = inject(I18nService);
  loading = signal(false);

  periodicityOptions: { value: PeriodicityOption; label: string }[] = [
    { value: 'week', label: 'settings.period.week' },
    { value: 'month', label: 'settings.period.month' },
    { value: 'quarter', label: 'settings.period.quarter' },
  ];

  get currentPeriodicity(): PeriodicityOption {
    return this.user()?.analytics_snapshot_periodicity ?? 'month';
  }

  get currentEnabled(): boolean {
    return this.user()?.analytics_snapshots_enabled ?? true;
  }

  async onPeriodicityChange(value: PeriodicityOption): Promise<void> {
    this.loading.set(true);
    try {
      await this.userService.updateProfile({
        analytics_snapshot_periodicity: value,
      });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('settings.saved'),
        detail: this.i18n.t('settings.analyticsFrequencyUpdated'),
        life: 3000,
      });
    } catch (err: unknown) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail:
          (err as { error?: { message?: string } })?.error?.message ??
          this.i18n.t('settings.failedToSave'),
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  async onEnabledChange(checked: boolean): Promise<void> {
    this.loading.set(true);
    try {
      await this.userService.updateProfile({
        analytics_snapshots_enabled: checked,
      });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('settings.saved'),
        detail: checked
          ? this.i18n.t('settings.analyticsSnapshotsEnabled')
          : this.i18n.t('settings.analyticsSnapshotsDisabled'),
        life: 3000,
      });
    } catch (err: unknown) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail:
          (err as { error?: { message?: string } })?.error?.message ??
          this.i18n.t('settings.failedToSave'),
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
