import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '@/shared/services/currency/currency.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
})
export class AppCurrencyPipe implements PipeTransform {
  private readonly currencyService = inject(CurrencyService);

  /**
   * Format amount as currency.
   * @param value Amount to format
   * @param currencyCode Optional: use this currency (e.g. card's currency). Otherwise app primary.
   */
  transform(value: number | null | undefined, currencyCode?: string): string {
    if (value == null || Number.isNaN(value)) return '';
    const code =
      currencyCode && currencyCode.length === 3 ? currencyCode : this.currencyService.primaryCode();
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
