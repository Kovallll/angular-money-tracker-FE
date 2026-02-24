import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import {
  budgetChartOptions,
  chartViewChoices,
  ChartViews,
  formatAmountWithCurrency,
} from '../../lib';
import { MatSelectModule } from '@angular/material/select';
import { BudgetStatisticsService } from '../../services/budget-statistics.service';
import { MatIconModule } from '@angular/material/icon';
import { SelectComponent } from '@/entities/select/ui/select.component';
import { SelectOption } from '@/entities/select/lib';
import { chartColors } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

@Component({
  selector: 'budget-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
    SelectComponent,
  ],
  templateUrl: './budget-stats.component.html',
  styleUrl: `./budget-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetStatisticCardComponent {
  private budgetStatisticsService = inject(BudgetStatisticsService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  isWithSeeAll = input(false);
  seeAllPath = input<string>('');
  fixedView = input<SelectOption<`${ChartViews}`>>();
  title = input<string>('Budget');
  chartViewChoices = signal<SelectOption<`${ChartViews}`>[]>(chartViewChoices);

  offset = signal(0);

  currentView = linkedSignal(() => this.fixedView() || this.chartViewChoices()[0]);

  chartData = computed(() =>
    this.budgetStatisticsService.getPeriodTransactionsData(this.currentView().value, this.offset()),
  );

  /** Chart data with amounts converted to primary currency (reactive to header). */
  data = computed(() => {
    const raw = this.chartData();
    const primary = this.currencyService.primaryCode();
    const expenses = raw.expenses.map((v) => this.exchangeRates.convert(v, 'BYN', primary));
    const revenue = raw.revenue.map((v) => this.exchangeRates.convert(v, 'BYN', primary));
    return {
      labels: raw.labels,
      datasets: [
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: chartColors.red,
          borderWidth: 1,
        },
        {
          label: 'Revenue',
          data: revenue,
          backgroundColor: chartColors.blue,
          borderWidth: 1,
        },
      ],
    };
  });

  /** Options with tooltip and y-axis label in primary currency. */
  options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    const base = budgetChartOptions ?? {};
    return {
      ...base,
      plugins: {
        ...base.plugins,
        tooltip: {
          ...base.plugins?.tooltip,
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${formatAmountWithCurrency(ctx.parsed.y ?? 0, code)}`,
          },
        },
      },
      scales: {
        ...base.scales,
        y: {
          ...(typeof base.scales?.['y'] === 'object' ? base.scales['y'] : {}),
          title: {
            display: true,
            text: code,
            color: 'rgba(255,255,255,0.8)',
            font: { size: 12 },
          },
        },
      },
    };
  });

  handleOffsetChange(offset: number) {
    this.offset.update((prev) => prev + offset);
  }

  handleClickPrev() {
    this.handleOffsetChange(-1);
  }

  handleClickNext() {
    if (this.offset() === 0) return;
    this.handleOffsetChange(1);
  }

  onValueChange(newValue: string) {
    const newView = this.chartViewChoices().find((item) => item.value === newValue)!;
    this.currentView.set(newView);
    this.offset.set(0);
  }
}
