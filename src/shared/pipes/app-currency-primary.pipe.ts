import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

/**
 * Converts amount from source currency to the app's primary (header) currency and formats.
 * Use for subscriptions, goals, etc. so displayed amounts follow the global currency selector.
 */
@Pipe({
  name: 'appCurrencyPrimary',
  standalone: true,
  pure: false, // re-run when primary currency (header) changes
})
export class AppCurrencyPrimaryPipe implements PipeTransform {
  private readonly currencyService = inject(CurrencyService);
  private readonly exchangeRates = inject(ExchangeRatesService);

  transform(value: number | null | undefined, fromCurrencyCode?: string): string {
    if (value == null || Number.isNaN(value)) return '';
    const from = fromCurrencyCode && fromCurrencyCode.length === 3 ? fromCurrencyCode : 'BYN';
    const primary = this.currencyService.primaryCode();
    const converted = this.exchangeRates.convert(value, from, primary);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: primary,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  }
}
