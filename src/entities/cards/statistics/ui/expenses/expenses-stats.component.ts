import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';

import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ExpensesStatisticsService } from '../../services/expenses-statistic.service';
import { expensesOptions } from '../../lib';

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
  maxDisplay = input<number>();
  title = input<string>('Expenses');
  options = expensesOptions;

  chartData = computed(() =>
    this.expensesStatisticsService.getCategoriesChartData(this.maxDisplay()),
  );

  data = computed(() => ({
    labels: this.chartData().labels,
    datasets: [
      {
        axis: 'y',
        data: this.chartData().dataset,
        backgroundColor: this.chartData().bgColors,
        fill: false,
        borderWidth: 1,
      },
    ],
  }));

  constructor(private readonly expensesStatisticsService: ExpensesStatisticsService) {}
}
