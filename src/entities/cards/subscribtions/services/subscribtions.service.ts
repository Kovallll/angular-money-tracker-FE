import { SubscribeItem } from '@/shared';
import { SubscribtionsHttpService } from '@/shared';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class SubscribtionsService {
  private subscribeHttpService = inject(SubscribtionsHttpService);

  /**
   * Следующая дата списания по lastCharge и типу подписки (для сортировки).
   * Для onetime возвращает дату lastCharge (единоразовые сортируются по дате оплаты).
   */
  private getNextChargeDate(sub: SubscribeItem): dayjs.Dayjs {
    const d = dayjs(sub.lastCharge || sub.subscribeDate);
    const type = (sub.type || '').toLowerCase();
    if (type === 'onetime' || type === 'one-time') return d;
    if (type === 'daily') return d.add(1, 'day');
    if (type === 'monthly') return d.add(1, 'month');
    if (type === 'yearly' || type === 'annually') return d.add(1, 'year');
    return d.add(1, 'month');
  }

  /** Все подписки, отсортированные по ближайшей дате переподписки (следующее списание — первыми). */
  getSubscribesForDashboard(): SubscribeItem[] {
    return [...this.subscribeHttpService.subscriptions()].sort((a, b) =>
      this.getNextChargeDate(a).diff(this.getNextChargeDate(b)),
    );
  }

  getPairsItems(): SubscribeItem[][] {
    const list = this.getSubscribesForDashboard();
    const acc: SubscribeItem[][] = [];
    for (const cur of list) {
      const last = acc.at(-1);
      if (!last || last.length === 2) {
        acc.push([cur]);
      } else {
        last.push(cur);
      }
    }
    return acc;
  }

  getSubscribes() {
    return this.subscribeHttpService.subscriptions();
  }
}
