import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { goalsOptions, formatAmountWithCurrency } from '../../lib';
import { GoalsStatisticsService } from '../../services/goals-statistics.service';
import { GoalsHttpService } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChartConfiguration, TooltipItem } from 'chart.js';

@Component({
  selector: 'goals-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
    ProgressSpinner,
  ],
  templateUrl: './goals-stats.component.html',
  styleUrl: `./goals-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalsStatisticCardComponent {
  private goalsStatisticsService = inject(GoalsStatisticsService);
  private goalsHttpService = inject(GoalsHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  isLoading = this.goalsHttpService.isLoading;

  maxDisplay = input<number>();
  title = input<string>('Goals statistics');

  chartData = computed(() => this.goalsStatisticsService.getGoalsChartData());

  hasChartData = computed(() => (this.data().datasets?.length ?? 0) > 0);

  /** Chart data with amounts converted to primary currency (reactive to header). */
  data = computed(() => {
    const raw = this.chartData();
    const primary = this.currencyService.primaryCode();
    return {
      datasets: raw.datasets.map((goal) => {
        const fromCurrency = (goal as { currencyCode?: string }).currencyCode ?? 'BYN';
        return {
          axis: 'y' as const,
          data: goal.data.map((pt) => ({
            ...pt,
            y: this.exchangeRates.convert(pt.y, fromCurrency, primary),
          })),
          backgroundColor: goal.backgroundColor,
          label: goal.label,
          fill: false,
          borderWidth: 1,
        };
      }),
    };
  });

  /** Options with tooltip and axis title in primary currency. */
  options = computed<ChartConfiguration<'scatter'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      ...goalsOptions,
      scales: {
        ...goalsOptions.scales,
        y: {
          ...goalsOptions.scales?.y,
          title: {
            display: true,
            text: `Budget left (${code})`,
          },
        },
      },
      plugins: {
        ...goalsOptions.plugins,
        tooltip: {
          ...goalsOptions.plugins?.tooltip,
          callbacks: {
            label: (ctx: TooltipItem<'scatter'>) =>
              `${ctx.dataset.label}: ${formatAmountWithCurrency(ctx.parsed.y ?? 0, code)} (${ctx.parsed.x} days left)`,
          },
        },
      },
    };
  });
}
