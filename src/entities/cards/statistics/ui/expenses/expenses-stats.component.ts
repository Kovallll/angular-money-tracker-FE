import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ExpensesStatisticsService } from '../../services/expenses-statistic.service';
import { expensesOptions, formatAmountWithCurrency } from '../../lib';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

@Component({
  selector: 'expenses-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './expenses-stats.component.html',
  styleUrl: `./expenses-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesStatisticCardComponent {
  private expensesStatisticsService = inject(ExpensesStatisticsService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  maxDisplay = input<number>();
  title = input<string>('Expenses');

  chartData = computed(() =>
    this.expensesStatisticsService.getCategoriesChartData(this.maxDisplay()),
  );

  /** Chart data with amounts converted to primary currency (reactive to header). */
  data = computed(() => {
    const raw = this.chartData();
    const primary = this.currencyService.primaryCode();
    const dataset = raw.dataset.map((v) => this.exchangeRates.convert(v, 'BYN', primary));
    return {
      labels: raw.labels,
      datasets: [
        {
          axis: 'y' as const,
          data: dataset,
          backgroundColor: raw.bgColors,
          fill: false,
          borderWidth: 1,
        },
      ],
    };
  });

  /** Options with axis and tooltip in primary currency. */
  options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    const base = expensesOptions ?? {};
    const baseScalesX = base.scales?.['x'] as { ticks?: Record<string, unknown> } | undefined;
    return {
      ...base,
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins?.tooltip,
          callbacks: {
            label: (ctx) => formatAmountWithCurrency(ctx.parsed.x ?? 0, code),
          },
        },
      },
      scales: {
        ...base.scales,
        x: {
          ...baseScalesX,
          ticks: {
            ...baseScalesX?.ticks,
            callback: (v: unknown) => formatAmountWithCurrency(Number(v), code),
            color: 'white',
          },
        },
      },
    };
  });
}
