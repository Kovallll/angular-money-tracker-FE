import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCard, CardBody } from '../card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
@Component({
  selector: 'statistic-card',
  standalone: true,
  imports: [DashboardCard, CardBody, BaseChartDirective],
  templateUrl: './statistic-card.html',
  styleUrl: `./statistic-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticCardComponent {
  title = 'Statistics';

  labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  data: ChartConfiguration<'bar'>['data'] = {
    labels: this.labels,
    datasets: [
      {
        label: 'Expenses',
        data: [500, 700, 600, 800, 750, 900, 650],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',

        borderWidth: 1,
      },
      {
        label: 'Revenue',
        data: [800, 950, 700, 1000, 1100, 1200, 900],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',

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
