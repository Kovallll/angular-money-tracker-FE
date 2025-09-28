import { SubscribeItem } from '@/shared';
import { subscribes } from '@/shared/constants/subscribtions';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class SubscribtionsService {
  private subscribes = subscribes;

  getUpcomingSubscribes() {
    return this.subscribes
      .filter((sub) =>
        dayjs(sub.subscribeDate).isBetween(dayjs(), dayjs().add(21, 'day'), null, '[]'),
      )
      .sort((a, b) => dayjs(a.subscribeDate).diff(dayjs(b.subscribeDate)));
  }

  getPairsItems() {
    return this.getUpcomingSubscribes().reduce((acc: SubscribeItem[][], cur) => {
      const last = acc.at(-1);
      if (!last || last.length === 2) {
        acc.push([cur]);
      } else {
        last.push(cur);
      }
      return acc;
    }, []);
  }

  getSubscribes() {
    return this.subscribes;
  }
}
