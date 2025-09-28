import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';

import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { goalsOptions } from '../../lib';
import { GoalsStatisticsService } from '../../services/goals-statistics.service';

@Component({
  selector: 'goals-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './goals-stats.component.html',
  styleUrl: `./goals-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalsStatisticCardComponent {
  maxDisplay = input<number>();
  title = input<string>('Goals statistics');
  options = goalsOptions;

  chartData = computed(() => this.goalsStatisticsService.getGoalsChartData());

  data = computed(() => ({
    datasets: this.chartData().datasets.map((goal) => ({
      axis: 'y',
      data: goal.data,
      backgroundColor: goal.backgroundColor,
      label: goal.label,
      fill: false,
      borderWidth: 1,
    })),
  }));

  constructor(private readonly goalsStatisticsService: GoalsStatisticsService) {}
}
