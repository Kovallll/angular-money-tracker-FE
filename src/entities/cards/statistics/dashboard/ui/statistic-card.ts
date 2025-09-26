import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { RoutePaths } from '@/shared';
@Component({
  selector: 'dash-statistic-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, BaseChartDirective],
  templateUrl: './statistic-card.html',
  styleUrl: `./statistic-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatisticCardComponent {
  title = 'Statistics';
  seeAllPath = RoutePaths.STATISTICS;
  labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  data: ChartConfiguration<'bar'>['data'] = {
    labels: this.labels,
    datasets: [
      {
        label: 'Expenses',
        data: [500, 700, 600, 800, 750, 900, 650],
        backgroundColor: '#ef4444',

        borderWidth: 1,
      },
      {
        label: 'Revenue',
        data: [800, 950, 700, 1000, 1100, 1200, 900],
        backgroundColor: '#3b82f6',

        borderWidth: 1,
      },
    ],
  };

  options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
}
