import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import { budgetChartOptions, chartViewChoices, ChartViews } from '../../lib';
import { MatSelectModule } from '@angular/material/select';
import { BudgetStatisticsService } from '../../services/budget-statistics.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'budget-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './budget-stats.component.html',
  styleUrl: `./budget-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetStatisticCardComponent {
  isWithSeeAll = input(false);
  seeAllPath = input<string>('');
  fixedView = input<`${ChartViews}`>();
  title = input<string>('Budget');
  chartViewChoices = chartViewChoices;
  options = budgetChartOptions;

  offset = signal(0);

  currentView = linkedSignal(() => this.fixedView() || chartViewChoices[0]);

  chartData = computed(() =>
    this.budgetStatisticsService.getPeriodTransactionsData(this.currentView(), this.offset()),
  );

  data = computed(() => ({
    labels: this.chartData().labels,
    datasets: [
      {
        label: 'Expenses',
        data: this.chartData().expenses,
        backgroundColor: '#ef4444',
        borderWidth: 1,
      },
      {
        label: 'Revenue',
        data: this.chartData().income,
        backgroundColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  }));

  constructor(private readonly budgetStatisticsService: BudgetStatisticsService) {}

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

  handleClickSelect() {
    this.offset.set(0);
  }
}
