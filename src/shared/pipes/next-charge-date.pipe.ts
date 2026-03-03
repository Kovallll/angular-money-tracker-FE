import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import type { SubscribeItem } from '@/shared/types';

/**
 * Calculates and returns the next charge date for a subscription based on lastCharge/subscribeDate and type.
 * Logic: lastCharge + 1 day (daily), + 1 month (monthly), + 1 year (annually/yearly).
 * For one-time (onetime) returns null — no next charge.
 */
@Pipe({
  name: 'nextChargeDate',
  standalone: true,
})
export class NextChargeDatePipe implements PipeTransform {
  transform(sub: SubscribeItem | null | undefined): Date | null {
    if (!sub) return null;
    const base = sub.lastCharge || sub.subscribeDate;
    if (!base) return null;
    const type = (sub.type || '').toLowerCase();
    if (type === 'onetime' || type === 'one-time') return null;
    const d = dayjs(base);
    let next = d;
    if (type === 'daily') next = d.add(1, 'day');
    else if (type === 'monthly') next = d.add(1, 'month');
    else if (type === 'yearly' || type === 'annually') next = d.add(1, 'year');
    else next = d.add(1, 'month');
    return next.toDate();
  }
}
