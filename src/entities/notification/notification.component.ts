import { PushService } from '@/shared/services/push/push.service';
import { AuthService } from '@/shared/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  standalone: true,
})
export class NotificationComponent implements OnInit {
  pushEnabled = false;
  loading = false;
  error: string | null = null;
  userId: string | null = null;

  constructor(
    private pushService: PushService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    // Получаем userId из сервиса, а не localStorage
    this.authService.user$.subscribe((user) => {
      this.userId = user?.id || null;
    });

    // Проверяем текущую подписку
    const subscription = await this.pushService.getCurrentSubscription();
    this.pushEnabled = !!subscription;

    // Подписываемся на сообщения только если push включен
    if (this.pushService.isEnabled()) {
      this.pushService.getMessages().subscribe((msg) => {
        console.log('📨 Push получен:', msg);
      });
    }
  }

  async enablePush() {
    if (!this.userId) {
      this.error = 'Сначала войдите в систему';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const subscription = await this.pushService.createSubscription();

      if (subscription) {
        // Отправляем подписку на сервер
        await firstValueFrom(this.pushService.saveSubscription(this.userId, subscription));
        this.pushEnabled = true;
        console.log('✅ Push включен');
      } else {
        this.error = 'Не удалось создать подписку';
      }
    } catch (err: any) {
      this.error = err.message || 'Ошибка включения уведомлений';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async disablePush() {
    if (!this.userId) return;

    this.loading = true;

    try {
      // Отправляем запрос на отписку к серверу
      await firstValueFrom(this.pushService.removeSubscription(this.userId));

      // Отписываемся локально
      await this.pushService.unsubscribe();
      this.pushEnabled = false;
      console.log('🔕 Push отключен');
    } catch (err: any) {
      this.error = err.message || 'Ошибка отключения';
    } finally {
      this.loading = false;
    }
  }
}
