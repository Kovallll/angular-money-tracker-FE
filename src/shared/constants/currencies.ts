export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  /** For selector display: "BYN", "USD", "EUR" */
  label: string;
}

export const CURRENCIES: CurrencyItem[] = [
  { code: 'BYN', symbol: 'Br', name: 'Belarusian ruble', label: 'BYN' },
  { code: 'USD', symbol: '$', name: 'US dollar', label: 'USD' },
  { code: 'EUR', symbol: '€', name: 'Euro', label: 'EUR' },
  { code: 'RUB', symbol: '₽', name: 'Russian ruble', label: 'RUB' },
];

/** Default primary currency for the app (header dropdown). */
export const DEFAULT_PRIMARY_CURRENCY = 'BYN';
/** Default secondary currency (shown below primary on balance cards). */
export const DEFAULT_SECONDARY_CURRENCY = 'USD';
export const STORAGE_KEY_PRIMARY_CURRENCY = 'app_primary_currency';
export const STORAGE_KEY_SECONDARY_CURRENCY = 'app_secondary_currency';

/** @deprecated Use primary currency from CurrencyService */
export const DEFAULT_CURRENCY_CODE = DEFAULT_PRIMARY_CURRENCY;
export const STORAGE_KEY_CURRENCY = STORAGE_KEY_PRIMARY_CURRENCY;
