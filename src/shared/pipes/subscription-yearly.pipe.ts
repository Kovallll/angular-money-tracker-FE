import { Pipe, PipeTransform, inject } from '@angular/core';
import type { SubscribeItem } from '@/shared/types';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

/**
 * Returns yearly amount for a subscription:
 * - monthly → amount × 12
 * - yearly/annually → amount × 1
 * - daily → amount × 365
 * - one-time → null
 */
export function getSubscriptionYearlyAmount(amount: number, type: string): number | null {
  const t = (type || '').toLowerCase();
  if (t === 'onetime' || t === 'one-time') return null;
  if (t === 'monthly') return amount * 12;
  if (t === 'yearly' || t === 'annually') return amount * 1;
  if (t === 'daily') return amount * 365;
  return amount * 12; // default like monthly
}

/**
 * Returns period label for subscription amount: /mo, /yr, /day, or '' for one-time.
 */
export function getSubscriptionPeriodLabel(type: string): string {
  const t = (type || '').toLowerCase();
  if (t === 'onetime' || t === 'one-time') return '';
  if (t === 'monthly') return '/mo';
  if (t === 'yearly' || t === 'annually') return '/yr';
  if (t === 'daily') return '/day';
  return '/mo';
}

/** Whether to show yearly estimate (hide for one-time and when same as amount for yearly). */
export function showSubscriptionYearlyEstimate(type: string): boolean {
  const t = (type || '').toLowerCase();
  if (t === 'onetime' || t === 'one-time') return false;
  if (t === 'yearly' || t === 'annually') return false;
  return true;
}

@Pipe({
  name: 'subscriptionYearly',
  standalone: true,
  pure: false,
})
export class SubscriptionYearlyPipe implements PipeTransform {
  private readonly currencyService = inject(CurrencyService);
  private readonly exchangeRates = inject(ExchangeRatesService);

  transform(sub: SubscribeItem | null | undefined): {
    periodLabel: string;
    yearlyFormatted: string | null;
  } {
    if (!sub) return { periodLabel: '', yearlyFormatted: null };
    const amount = Number(sub.amount);
    if (Number.isNaN(amount)) return { periodLabel: '', yearlyFormatted: null };
    const periodLabel = getSubscriptionPeriodLabel(sub.type);
    const yearly = getSubscriptionYearlyAmount(amount, sub.type);
    const showYearly = showSubscriptionYearlyEstimate(sub.type);
    let yearlyFormatted: string | null = null;
    if (yearly != null && showYearly) {
      const from = sub.currencyCode && sub.currencyCode.length === 3 ? sub.currencyCode : 'BYN';
      const primary = this.currencyService.primaryCode();
      const converted = this.exchangeRates.convert(yearly, from, primary);
      yearlyFormatted =
        '~' +
        new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: primary,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(converted) +
        '/yr';
    }
    return { periodLabel, yearlyFormatted };
  }
}
