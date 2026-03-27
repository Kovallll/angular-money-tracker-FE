import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { BaseChartDirective } from 'ng2-charts';
import type { AnalyticsSnapshotItem } from '@/shared/types';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-snapshot-view-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: './snapshot-view-dialog.component.html',
  styleUrl: './snapshot-view-dialog.component.scss',
})
export class SnapshotViewDialogComponent {
  private config = inject(DynamicDialogConfig);
  snapshot: AnalyticsSnapshotItem = this.config.data?.snapshot;

  get pieData(): ChartConfiguration<'doughnut'>['data'] {
    const o = this.snapshot?.overview?.pie;
    if (!o?.labels?.length || !o?.datasets?.[0]) return { labels: [], datasets: [] };
    return {
      labels: o.labels,
      datasets: o.datasets,
    };
  }

  get barData(): ChartConfiguration<'bar'>['data'] {
    const o = this.snapshot?.overview?.bar;
    if (!o?.labels?.length || !o?.datasets?.length) return { labels: [], datasets: [] };
    return {
      labels: o.labels,
      datasets: o.datasets,
    };
  }

  get lineData(): ChartConfiguration<'line'>['data'] {
    const o = this.snapshot?.overview?.line;
    if (!o?.labels?.length || !o?.datasets?.length) return { labels: [], datasets: [] };
    return {
      labels: o.labels,
      datasets: o.datasets,
    };
  }

  hasPie = (): boolean =>
    !!this.pieData?.labels?.length && !!this.pieData?.datasets?.[0]?.data?.length;
  hasBar = (): boolean => !!this.barData?.labels?.length && !!this.barData?.datasets?.length;
  hasLine = (): boolean => !!this.lineData?.labels?.length && !!this.lineData?.datasets?.length;

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    cutout: '60%',
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };
}
