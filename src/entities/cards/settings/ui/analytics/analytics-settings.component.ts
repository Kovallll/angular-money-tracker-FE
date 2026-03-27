import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@/shared';
import { User } from '@/shared/types';
import { MessageService } from 'primeng/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export type PeriodicityOption = 'week' | 'month' | 'quarter';

@Component({
  selector: 'settings-analytics',
  templateUrl: './analytics-settings.component.html',
  styleUrls: ['./analytics-settings.component.scss'],
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule],
})
export class AnalyticsSettingsComponent {
  user = input<User | null>(null);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  loading = signal(false);

  periodicityOptions: { value: PeriodicityOption; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
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
        summary: 'Saved',
        detail: 'Analytics save frequency updated.',
        life: 3000,
      });
    } catch (err: unknown) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: (err as { error?: { message?: string } })?.error?.message ?? 'Failed to save.',
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
        summary: 'Saved',
        detail: checked ? 'Analytics snapshots enabled.' : 'Analytics snapshots disabled.',
        life: 3000,
      });
    } catch (err: unknown) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: (err as { error?: { message?: string } })?.error?.message ?? 'Failed to save.',
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
