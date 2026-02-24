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

  view = input<'row' | 'column'>('column');

  pieData = signal<ChartConfiguration<'doughnut'>['data']>({ labels: [], datasets: [] });
  barData = signal<ChartConfiguration<'bar'>['data']>(EMPTY_BAR);
  lineData = signal<ChartConfiguration<'line'>['data']>(EMPTY_LINE);

  hasPieData = computed(() => hasChartData(this.pieData(), 'doughnut'));
  hasBarData = computed(() => hasChartData(this.barData(), 'bar'));
  hasLineData = computed(() => hasChartData(this.lineData(), 'line'));

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
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true, color: 'white', font: { size: 16 } },
        },
        tooltip: {
          titleFont: { size: 30 },
          bodyFont: { size: 20 },
          callbacks: {
            label: (ctx) => `${ctx.label}: ${this.formatWithCurrency(ctx.parsed as number, code)}`,
          },
        },
      },
      cutout: '60%',
    };
  });

  barOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, color: 'white', font: { size: 16 } },
        },
        tooltip: {
          titleFont: { size: 30 },
          bodyFont: { size: 20 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y as number, code)}`,
          },
        },
      },
      scales: {
        x: { stacked: false, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'white',
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
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { size: 30 },
          bodyFont: { size: 20 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y ?? 0, code)}`,
          },
        },
      },
      elements: { line: { borderWidth: 2 }, point: { radius: 2 } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'white',
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
