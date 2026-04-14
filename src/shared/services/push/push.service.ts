// src/app/services/push.service.ts
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PushService {
  private vapidPublicKey: string | null = null;

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
  ) {}

  // Проверка поддержки push
  isEnabled(): boolean {
    return this.swPush.isEnabled;
  }

  // Загрузка VAPID ключа с сервера
  async loadVapidKey(): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`push/vapid-key`).pipe(take(1)),
      );
      this.vapidPublicKey = response.publicKey;
      return this.vapidPublicKey;
    } catch (error) {
      console.error('Не удалось загрузить VAPID ключ:', error);
      return null;
    }
  }

  // Получение текущей подписки
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.swPush.isEnabled) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  // Создание новой подписки
  async createSubscription(): Promise<PushSubscription | null> {
    if (!this.swPush.isEnabled) {
      throw new Error('Push notifications are not supported in this browser');
    }

    // Загружаем ключ если нет
    if (!this.vapidPublicKey) {
      await this.loadVapidKey();
    }

    if (!this.vapidPublicKey) {
      throw new Error('VAPID ключ не загружен');
    }

    // Если подписка уже есть в браузере — переиспользуем ее.
    const existingSubscription = await this.getCurrentSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      if (permission === 'denied') {
        throw new Error(
          'Browser notifications are blocked for this site. Allow them in site settings and try again.',
        );
      }
      return null;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidPublicKey,
      });

      return subscription;
    } catch (err: unknown) {
      console.error('Ошибка создания подписки:', err);
      if (err instanceof Error && err.message) {
        throw new Error(`Failed to create push subscription: ${err.message}`);
      }
      throw new Error('Failed to create push subscription');
    }
  }

  // Сохранение подписки на сервере
  saveSubscription(userId: string, subscription: PushSubscription): Observable<any> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return this.http.post(`push/${userId}/subscribe-push`, {
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
      timezone,
    });
  }

  // Удаление подписки с сервера
  removeSubscription(userId: string): Observable<any> {
    return this.http.post(`push/${userId}/unsubscribe-push`, {});
  }

  // Отписка локально
  async unsubscribe(): Promise<boolean> {
    if (!this.swPush.isEnabled) return false;

    try {
      const subscription = await this.getCurrentSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ошибка отписки:', err);
      return false;
    }
  }

  // Получение сообщений
  getMessages(): Observable<any> {
    return this.swPush.messages;
  }

  // Обработка кликов на уведомления
  getNotificationClicks(): Observable<any> {
    return this.swPush.notificationClicks;
  }
}
