import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const NBRB_BASE = 'https://api.nbrb.by/exrates';

/** NBRB returns rates in BYN per Cur_Scale units of foreign currency. 1 USD = Cur_OfficialRate/Cur_Scale BYN. */
export interface NbrbRateItem {
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_OfficialRate: number;
}

/** NBRB dynamics item: rate on a date (per Cur_Scale units). */
export interface NbrbDynamicsItem {
  Cur_OfficialRate: number;
  Date: string;
}

/** NBRB internal currency IDs for dynamics API. */
const NBRB_CURRENCY_IDS: Record<string, number> = {
  USD: 431,
  EUR: 451,
  RUB: 456,
};

/** Fallback when API fails. 1 unit of key = value BYN (e.g. 1 USD = 3.27 BYN). */
const FALLBACK_RATES_TO_BYN: Record<string, number> = {
  BYN: 1,
  USD: 3.27,
  EUR: 3.55,
  RUB: 0.0355,
};

@Injectable({ providedIn: 'root' })
export class ExchangeRatesService {
  private http = inject(HttpClient);
  private readonly cache = signal<Record<string, Record<string, number>> | null>(null);
  private readonly cacheDate = signal<string>('');
  private readonly loading = signal(false);

  readonly isLoading = this.loading;
  readonly ratesReady = computed(() => this.cache() !== null);

  /** Get exchange rate: 1 unit of fromCode = X units of toCode. */
  getRate(fromCode: string, toCode: string): number {
    if (fromCode === toCode) return 1;
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    const cached = this.cache();
    if (cached?.[from]?.[to] != null) return cached[from][to];
    const fallback = this.getFallbackMatrix();
    return fallback[from]?.[to] ?? 1;
  }

  /** Convert amount from one currency to another. */
  convert(amount: number, fromCode: string, toCode: string): number {
    return amount * this.getRate(fromCode, toCode);
  }

  /** Load latest rates from NBRB (api.nbrb.by). All rates are in BYN per 1 unit of foreign currency. */
  async loadRates(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    if (this.cacheDate() === today && this.cache()) return;

    this.loading.set(true);
    try {
      const list = await this.http
        .get<NbrbRateItem[]>(`${NBRB_BASE}/rates?ondate=${today}&periodicity=0`)
        .toPromise();
      const rateToByn = this.parseNbrbRates(list ?? []);
      const matrix = this.buildMatrixFromRateToByn(rateToByn);
      this.cache.set(matrix);
      this.cacheDate.set(today);
    } catch {
      this.cache.set(this.getFallbackMatrix());
      this.cacheDate.set(today);
    } finally {
      this.loading.set(false);
    }
  }

  /** Parse NBRB response: Cur_OfficialRate/Cur_Scale = BYN per 1 unit of foreign currency. */
  private parseNbrbRates(list: NbrbRateItem[]): Record<string, number> {
    const rateToByn: Record<string, number> = { BYN: 1 };
    for (const item of list) {
      const code = item.Cur_Abbreviation?.toUpperCase();
      if (!code || code === 'BYN') continue;
      const scale = Math.max(1, Number(item.Cur_Scale) || 1);
      rateToByn[code] = Number(item.Cur_OfficialRate) / scale;
    }
    for (const [k, v] of Object.entries(FALLBACK_RATES_TO_BYN)) {
      if (k !== 'BYN' && rateToByn[k] == null) rateToByn[k] = v;
    }
    return rateToByn;
  }

  /** Build matrix[from][to] = how many "to" per 1 "from". From rateToByn: 1 C = rateToByn[C] BYN. */
  private buildMatrixFromRateToByn(
    rateToByn: Record<string, number>,
  ): Record<string, Record<string, number>> {
    const all = [
      'BYN',
      'USD',
      'EUR',
      'RUB',
      ...Object.keys(rateToByn).filter((c) => !['BYN', 'USD', 'EUR', 'RUB'].includes(c)),
    ];
    const uniq = [...new Set(all)];
    const matrix: Record<string, Record<string, number>> = {};
    for (const from of uniq) {
      matrix[from] = matrix[from] ?? {};
      const fromPerByn = rateToByn[from] ?? 1;
      for (const to of uniq) {
        const toPerByn = rateToByn[to] ?? 1;
        matrix[from][to] = from === to ? 1 : fromPerByn / toPerByn;
      }
    }
    return matrix;
  }

  private getFallbackMatrix(): Record<string, Record<string, number>> {
    return this.buildMatrixFromRateToByn(FALLBACK_RATES_TO_BYN);
  }

  /**
   * Load historical rates for chart (BYN per 1 unit of currency).
   * Returns array of { date, rate } for the last daysBack days.
   */
  async getRatesHistory(
    currencyCode: string,
    daysBack: number = 90,
  ): Promise<{ date: string; rate: number }[]> {
    const code = currencyCode.toUpperCase();
    if (code === 'BYN') {
      return Array.from({ length: daysBack }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysBack - 1 - i));
        return { date: d.toISOString().slice(0, 10), rate: 1 };
      });
    }
    const curId = NBRB_CURRENCY_IDS[code];
    if (!curId) return [];

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    try {
      const url = `${NBRB_BASE}/rates/dynamics/${curId}?startdate=${startStr}&enddate=${endStr}`;
      const list = await this.http.get<NbrbDynamicsItem[]>(url).toPromise();
      return (list ?? []).map((item) => ({
        date: item.Date.slice(0, 10),
        rate: item.Cur_OfficialRate,
      }));
    } catch {
      return [];
    }
  }

  /** Current rate to BYN for display (1 unit of code = X BYN). Uses cache or fallback. */
  getRateToByn(currencyCode: string): number {
    return this.getRate(currencyCode, 'BYN');
  }
}
