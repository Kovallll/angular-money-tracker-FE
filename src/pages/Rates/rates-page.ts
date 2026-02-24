import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CURRENCIES, CurrencyItem } from '@/shared/constants/currencies';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';

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
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    ProgressSpinner,
  ],
  templateUrl: './rates-page.html',
  styleUrl: './rates-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesPageComponent {
  private exchangeRates = inject(ExchangeRatesService);
  private messageService = inject(MessageService);

  readonly currencies = CURRENCIES;
  readonly isLoadingRates = this.exchangeRates.isLoading;

  /** Current rates table: 1 unit = X BYN */
  ratesList = computed(() => {
    const list: { currency: CurrencyItem; rateToByn: number }[] = [];
    for (const c of this.currencies) {
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
  chartHistoryLoading = signal(false);
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
  };
  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const history = this.chartHistory();
    const code = this.chartCurrency();
    const label = `1 ${code} = X BYN`;
    return {
      labels: history.map((h) => h.date),
      datasets: [
        {
          data: history.map((h) => h.rate),
          label,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false,
        },
      ],
    };
  });

  constructor() {
    effect(() => {
      this.exchangeRates.loadRates();
    });
    effect(() => {
      const code = this.chartCurrency();
      this.loadChartHistory(code);
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
      summary: 'Rates updated',
      detail: 'Exchange rates have been refreshed.',
      life: 3000,
    });
  }
}
