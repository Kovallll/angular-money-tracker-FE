import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CURRENCIES, CurrencyItem } from '@/shared/constants/currencies';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'app-rates-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AppButtonComponent,
    MatProgressSpinnerModule,
    MatTabsModule,
    ProgressSpinner,
    TranslateModule,
  ],
  templateUrl: './rates-page.html',
  styleUrl: './rates-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesPageComponent implements OnInit {
  private exchangeRates = inject(ExchangeRatesService);
  private messageService = inject(MessageService);
  private breakpointObserver = inject(BreakpointObserver);
  private i18n = inject(I18nService);

  readonly currencies = CURRENCIES;
  /** Currencies for chart: exclude BYN (no rate to itself) */
  readonly chartCurrencies = CURRENCIES.filter((c) => c.code !== 'BYN');
  readonly chartCurrencyOptions = computed(() => {
    this.i18n.currentLang();
    return this.chartCurrencies.map((c) => ({
      ...c,
      displayName: this.i18n.t(`currency.names.${c.code.toLowerCase()}`),
    }));
  });
  readonly isLoadingRates = this.exchangeRates.isLoading;

  /** Current rates table: 1 unit = X BYN (excludes BYN — no rate to itself) */
  ratesList = computed(() => {
    const list: { currency: CurrencyItem; rateToByn: number }[] = [];
    for (const c of this.currencies) {
      if (c.code === 'BYN') continue;
      list.push({
        currency: c,
        rateToByn: this.exchangeRates.getRateToByn(c.code),
      });
    }
    return list;
  });

  /**
   * Loan calculator — annuity (equal monthly payments).
   * Standard formula (Wikipedia, financeformulas.net): A = P × i(1+i)^n / ((1+i)^n − 1).
   * Equivalent form: A = P × i / (1 − (1+i)^(−n)). APR as annual % → monthly rate i = annual% / 100 / 12.
   */
  loanAmount = signal(10000);
  loanTermMonths = signal(12);
  loanRatePercent = signal(12);

  /** Normalized inputs: amount >= 0, term >= 1 month, rate >= 0 */
  private loanParams = computed(() => {
    const P = Math.max(0, Number(this.loanAmount()) || 0);
    const n = Math.max(1, Math.floor(Number(this.loanTermMonths()) || 1));
    const annualPercent = Math.max(0, Number(this.loanRatePercent()) || 0);
    return { P, n, annualPercent };
  });

  /** Monthly payment: A = P × i(1+i)^n / ((1+i)^n − 1); if i = 0 then A = P/n. */
  monthlyPayment = computed(() => {
    const { P, n, annualPercent } = this.loanParams();
    if (P <= 0) return 0;
    const i = annualPercent / 100 / 12; // monthly rate (APR/12)
    if (i === 0) return P / n;
    const onePlusI = 1 + i;
    const onePlusIPowN = Math.pow(onePlusI, n);
    const A = (P * i * onePlusIPowN) / (onePlusIPowN - 1);
    return Number.isFinite(A) ? A : 0;
  });

  totalPayment = computed(() => {
    const { n } = this.loanParams();
    return this.monthlyPayment() * n;
  });

  /** Total interest (overpayment) */
  totalInterest = computed(() => this.totalPayment() - (this.loanParams().P || 0));

  /** Currency chart */
  chartCurrency = signal<string>('USD');
  chartHistory = signal<{ date: string; rate: number }[]>([]);
  selectedDayIndex = signal(0);
  chartHistoryLoading = signal(false);
  /** На мобилке показываем меньше точек для читаемости */
  isMobileChart = signal(false);
  chartOptions = signal<ChartConfiguration<'line'>['options']>({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'nearest' },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y != null ? ctx.parsed.y.toFixed(4) : ''} BYN`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#aaa', maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#aaa' },
      },
    },
  });
  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const history = this.chartHistory();
    const code = this.chartCurrency();
    const label = this.i18n.t('rates.chartLabel', { code });
    const mobile = this.isMobileChart();
    // На мобилке — ~20 точек вместо 90 для читаемости
    const sampled = mobile && history.length > 25 ? this.sampleForMobile(history, 20) : history;
    const rates = sampled.map((h) => h.rate);
    const inflectionIndices = mobile ? this.findInflectionIndices(rates) : null;
    return {
      labels: sampled.map((h) => h.date),
      datasets: [
        {
          data: rates,
          label,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false,
          pointRadius: mobile ? rates.map((_, i) => (inflectionIndices!.has(i) ? 5 : 0)) : 3,
          pointHoverRadius: mobile ? 8 : 6,
          pointHitRadius: mobile ? 28 : 10,
        },
      ],
    };
  });

  readonly selectedDayPoint = computed(() => {
    const history = this.chartHistory();
    if (!history.length) return null;
    const idx = Math.max(0, Math.min(this.selectedDayIndex(), history.length - 1));
    return history[idx] ?? null;
  });

  /** Индексы точек излома (локальные min и max) для отображения на мобилке */
  private findInflectionIndices(rates: number[]): Set<number> {
    const indices = new Set<number>();
    if (rates.length < 3) return indices;
    indices.add(0);
    indices.add(rates.length - 1);
    for (let i = 1; i < rates.length - 1; i++) {
      const prev = rates[i - 1];
      const curr = rates[i];
      const next = rates[i + 1];
      if ((curr >= prev && curr >= next) || (curr <= prev && curr <= next)) {
        indices.add(i);
      }
    }
    return indices;
  }

  /** Равномерная выборка N точек из массива (первая, последняя + равномерно между) */
  private sampleForMobile<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return arr;
    const step = (arr.length - 1) / (n - 1);
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      const idx = i === n - 1 ? arr.length - 1 : Math.round(i * step);
      result.push(arr[idx]);
    }
    return result;
  }

  constructor() {
    effect(() => {
      this.exchangeRates.loadRates();
    });
    effect(() => {
      const code = this.chartCurrency();
      this.loadChartHistory(code);
    });
    effect(() => {
      const history = this.chartHistory();
      if (!history.length) {
        this.selectedDayIndex.set(0);
        return;
      }
      this.selectedDayIndex.set(history.length - 1);
    });
  }

  ngOnInit() {
    this.breakpointObserver.observe('(max-width: 600px)').subscribe((result) => {
      const isMobile = result.matches;
      this.isMobileChart.set(isMobile);
      this.chartOptions.set({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y != null ? ctx.parsed.y.toFixed(4) : ''} BYN`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: '#aaa',
              maxTicksLimit: isMobile ? 5 : 8,
              maxRotation: isMobile ? 45 : 0,
              minRotation: isMobile ? 45 : 0,
            },
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#aaa' },
          },
        },
      });
    });
  }

  async loadChartHistory(code: string) {
    this.chartHistoryLoading.set(true);
    try {
      const history = await this.exchangeRates.getRatesHistory(code, 90);
      this.chartHistory.set(history);
    } finally {
      this.chartHistoryLoading.set(false);
    }
  }

  async refreshRates() {
    await this.exchangeRates.loadRates();
    this.messageService.add({
      key: 'toast',
      severity: 'info',
      summary: this.i18n.t('rates.toast.updated'),
      detail: this.i18n.t('rates.toast.refreshed'),
      life: 3000,
    });
  }
}
