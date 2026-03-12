import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { exchangeRatesUrl } from '@/shared/constants';

/** Ответ бэкенда: курсы к BYN (1 единица валюты = X BYN). */
export interface ExchangeRatesResponse {
  rateToByn: Record<string, number>;
  date: string;
}

/** NBRB dynamics item (только для истории курсов для графиков). */
export interface NbrbDynamicsItem {
  Cur_OfficialRate: number;
  Date: string;
}

const NBRB_DYNAMICS_BASE = 'https://api.nbrb.by/exrates';
const NBRB_CURRENCY_IDS: Record<string, number> = {
  USD: 431,
  EUR: 451,
  RUB: 456,
};

/** Запасные курсы при недоступности бэкенда. 1 единица = X BYN. */
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

  /** Курс: 1 fromCode = X toCode. */
  getRate(fromCode: string, toCode: string): number {
    if (fromCode === toCode) return 1;
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    const cached = this.cache();
    if (cached?.[from]?.[to] != null) return cached[from][to];
    const fallback = this.getFallbackMatrix();
    return fallback[from]?.[to] ?? 1;
  }

  /** Конвертация суммы из одной валюты в другую. */
  convert(amount: number, fromCode: string, toCode: string): number {
    return amount * this.getRate(fromCode, toCode);
  }

  /** Загрузка курсов с бэкенда. При ошибке используются запасные курсы. */
  async loadRates(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    if (this.cacheDate() === today && this.cache()) return;

    this.loading.set(true);
    try {
      const res = await this.http.get<ExchangeRatesResponse>(exchangeRatesUrl).toPromise();
      const rateToByn = res?.rateToByn ?? FALLBACK_RATES_TO_BYN;
      const matrix = this.buildMatrixFromRateToByn(rateToByn);
      this.cache.set(matrix);
      this.cacheDate.set(res?.date ?? today);
    } catch {
      this.cache.set(this.getFallbackMatrix());
      this.cacheDate.set(today);
    } finally {
      this.loading.set(false);
    }
  }

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
   * История курсов для графиков (NBRB dynamics).
   * Оставлен запрос к NBRB, т.к. бэкенд отдаёт только текущие курсы.
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
      const url = `${NBRB_DYNAMICS_BASE}/rates/dynamics/${curId}?startdate=${startStr}&enddate=${endStr}`;
      const list = await this.http.get<NbrbDynamicsItem[]>(url).toPromise();
      return (list ?? []).map((item) => ({
        date: item.Date.slice(0, 10),
        rate: item.Cur_OfficialRate,
      }));
    } catch {
      return [];
    }
  }

  /** Текущий курс к BYN для отображения. */
  getRateToByn(currencyCode: string): number {
    return this.getRate(currencyCode, 'BYN');
  }
}
