import { Injectable, signal, computed } from '@angular/core';
import {
  CURRENCIES,
  CurrencyItem,
  DEFAULT_PRIMARY_CURRENCY,
  DEFAULT_SECONDARY_CURRENCY,
  STORAGE_KEY_PRIMARY_CURRENCY,
} from '@/shared/constants/currencies';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly primaryStored = signal<string>(this.loadPrimary());

  /** Primary currency (header dropdown). All app amounts reference this. */
  readonly primaryCode = this.primaryStored;
  /** Secondary: when BYN is primary → USD; when another is primary → BYN. */
  readonly secondaryCode = computed(() => {
    const primary = this.primaryStored();
    return primary === DEFAULT_PRIMARY_CURRENCY
      ? DEFAULT_SECONDARY_CURRENCY
      : DEFAULT_PRIMARY_CURRENCY;
  });

  readonly primaryCurrency = computed(
    () => CURRENCIES.find((c) => c.code === this.primaryStored()) ?? CURRENCIES[0],
  );
  readonly secondaryCurrency = computed(
    () => CURRENCIES.find((c) => c.code === this.secondaryCode()) ?? CURRENCIES[1],
  );

  /** @deprecated Use primaryCode */
  readonly currentCode = this.primaryStored;
  /** @deprecated Use primaryCurrency */
  readonly currentCurrency = this.primaryCurrency;

  readonly currencies: CurrencyItem[] = CURRENCIES;

  /** Set primary currency (e.g. from header dropdown). Secondary: BYN→USD, other→BYN. */
  setCurrency(code: string) {
    const next = CURRENCIES.some((c) => c.code === code) ? code : DEFAULT_PRIMARY_CURRENCY;
    this.primaryStored.set(next);
    try {
      localStorage.setItem(STORAGE_KEY_PRIMARY_CURRENCY, next);
    } catch {}
  }

  private loadPrimary(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRIMARY_CURRENCY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) return saved;
    } catch {}
    return DEFAULT_PRIMARY_CURRENCY;
  }
}
