import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { PushService } from '@/shared/services/push/push.service';
import { AuthService } from '@/shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  standalone: true,
  imports: [MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit {
  private readonly pushService = inject(PushService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pushEnabled = signal(false);
  readonly loading = signal(false);
  readonly pushSupported = signal(true);
  readonly userId = signal<string | null>(null);

  readonly tooltipText = computed(() => {
    if (this.pushEnabled()) return 'Push notifications enabled. Click to disable';
    if (!this.pushSupported()) return 'Push notifications are not supported in this browser';
    if (!this.userId()) return 'Sign in to enable notifications';
    return 'Push notifications disabled. Click to enable';
  });

  ngOnInit() {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => this.userId.set(user?.id ?? null));

    this.pushSupported.set(this.pushService.isEnabled());
    this.updatePushState();

    if (this.pushService.isEnabled()) {
      this.pushService
        .getMessages()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((msg) => {
          console.log('📨 Push получен:', msg);
        });
    }
  }

  private async updatePushState() {
    if (!this.pushService.isEnabled()) return;
    try {
      const subscription = await this.pushService.getCurrentSubscription();
      this.pushEnabled.set(!!subscription);
    } catch {
      this.pushEnabled.set(false);
    }
  }

  async onClick() {
    if (this.loading()) return;
    if (this.pushEnabled()) {
      await this.disablePush();
    } else {
      await this.enablePush();
    }
  }

  private async enablePush() {
    const uid = this.userId();
    if (!uid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sign in required',
        detail: 'Sign in to enable notifications',
        life: 3000,
      });
      return;
    }
    if (!this.pushService.isEnabled()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Not supported',
        detail: 'Push is not supported in this browser',
        life: 3000,
      });
      return;
    }

    this.loading.set(true);
    try {
      const subscription = await this.pushService.createSubscription();
      if (subscription) {
        await firstValueFrom(this.pushService.saveSubscription(uid, subscription));
        this.pushEnabled.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Done',
          detail: 'Notifications enabled',
          life: 2000,
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Failed',
          detail: 'Check browser permissions',
          life: 4000,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error enabling notifications';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  private async disablePush() {
    const uid = this.userId();
    if (!uid) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.pushService.removeSubscription(uid));
      await this.pushService.unsubscribe();
      this.pushEnabled.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Done',
        detail: 'Notifications disabled',
        life: 2000,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error disabling notifications';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    } finally {
      this.loading.set(false);
    }
  }
}
