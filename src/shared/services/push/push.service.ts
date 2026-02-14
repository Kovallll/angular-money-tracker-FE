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
      console.log('🔕 Push не поддерживается браузером');
      return null;
    }

    // Загружаем ключ если нет
    if (!this.vapidPublicKey) {
      await this.loadVapidKey();
    }

    if (!this.vapidPublicKey) {
      throw new Error('VAPID ключ не загружен');
    }

    // Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('❌ Пользователь отказал в разрешении');
      return null;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidPublicKey,
      });

      return subscription;
    } catch (err) {
      console.error('Ошибка создания подписки:', err);
      return null;
    }
  }

  // Сохранение подписки на сервере
  saveSubscription(userId: string, subscription: PushSubscription): Observable<any> {
    return this.http.post(`push/${userId}/subscribe-push`, {
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
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
