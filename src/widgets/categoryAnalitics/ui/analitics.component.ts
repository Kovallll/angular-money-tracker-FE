import { ExpensesOverviewDto, StatisticsHttpService } from '@/shared';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

const EMPTY_BAR: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
const EMPTY_LINE: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

@Component({
  selector: 'category-analitics',
  templateUrl: './analitics.component.html',
  styleUrls: ['./analitics.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
})
export class CategoryAnaliticsComponent implements OnInit {
  private statisticsHttpService = inject(StatisticsHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  view = input<'row' | 'column'>('column');

  pieData = signal<ChartConfiguration<'doughnut'>['data']>({ labels: [], datasets: [] });
  barData = signal<ChartConfiguration<'bar'>['data']>(EMPTY_BAR);
  lineData = signal<ChartConfiguration<'line'>['data']>(EMPTY_LINE);

  hasPieData = computed(() => hasChartData(this.pieData(), 'doughnut'));
  hasBarData = computed(() => hasChartData(this.barData(), 'bar'));
  hasLineData = computed(() => hasChartData(this.lineData(), 'line'));

  /** Pie data converted from BYN to current primary currency. */
  pieChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const raw = this.pieData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  /** Bar data converted from BYN to current primary currency. */
  barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const raw = this.barData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  /** Line data converted from BYN to current primary currency. */
  lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const raw = this.lineData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  private formatWithCurrency(v: number, currencyCode: string) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(v);
  }

  pieOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 8, bottom: 8, left: 4, right: 4 },
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            usePointStyle: true,
            color: 'white',
            font: { size: 13, weight: 500 },
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.label}: ${this.formatWithCurrency(ctx.parsed as number, code)}`,
          },
        },
      },
      cutout: '60%',
      elements: {
        arc: {
          spacing: 4,
          borderRadius: 3,
          borderWidth: 2,
          borderColor: 'rgba(0, 0, 0, 0.4)',
        },
      },
    };
  });

  barOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 8, right: 8, left: 4, bottom: 4 } },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            color: 'white',
            font: { size: 13, weight: 500 },
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y as number, code)}`,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 40,
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
          },
        },
      },
    };
  });

  lineOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      layout: { padding: { top: 8, right: 8, left: 4, bottom: 4 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y ?? 0, code)}`,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.35,
        },
        point: {
          radius: 3,
          hoverRadius: 6,
          hitRadius: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
          },
        },
      },
    };
  });

  ngOnInit() {
    this.statisticsHttpService
      .getExpensesOverview({ monthsBar: 6, topK: 5, locale: 'en' })
      .subscribe({
        next: (res: ExpensesOverviewDto) => {
          this.pieData.set(res.pie ?? { labels: [], datasets: [] });
          this.barData.set(res.bar ?? EMPTY_BAR);
          this.lineData.set(res.line ?? EMPTY_LINE);
        },
        error: () => {
          this.pieData.set({ labels: [], datasets: [] });
          this.barData.set(EMPTY_BAR);
          this.lineData.set(EMPTY_LINE);
        },
      });
  }
}

function hasChartData(
  data: ChartConfiguration<'doughnut' | 'bar' | 'line'>['data'] | undefined,
  kind: 'doughnut' | 'bar' | 'line',
): boolean {
  if (!data?.datasets?.length) return false;
  const labels = data.labels as string[] | undefined;
  if (!labels?.length) return false;
  for (const ds of data.datasets) {
    const arr = ds.data as number[];
    if (arr?.some((v) => typeof v === 'number' && v > 0)) return true;
  }
  return false;
}
