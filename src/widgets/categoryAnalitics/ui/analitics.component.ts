import { ExpensesOverviewDto, StatisticsHttpService } from '@/shared';
import { ChangeDetectionStrategy, Component, inject, input, signal, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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

  view = input<'row' | 'column'>('column');

  pieData = signal<ChartConfiguration<'doughnut'>['data']>({ datasets: [] });
  barData?: ChartConfiguration<'bar'>['data'];
  lineData?: ChartConfiguration<'line'>['data'];

  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
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
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed as number)}`,
        },
      },
    },
    cutout: '60%',
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
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
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y as number)}`,
        },
      },
    },
    scales: {
      x: { stacked: false, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { callback: (v) => formatCurrency(Number(v)), color: 'white' },
      },
    },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { size: 30 },
        bodyFont: { size: 20 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    elements: { line: { borderWidth: 2 }, point: { radius: 2 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { callback: (v) => formatCurrency(Number(v)), color: 'white' },
      },
    },
  };

  ngOnInit() {
    this.statisticsHttpService
      .getExpensesOverview({ monthsBar: 6, topK: 5, locale: 'en' })
      .subscribe((res: ExpensesOverviewDto) => {
        this.pieData.set(res.pie);
        this.barData = res.bar;
        this.lineData = res.line;
      });
  }
}
function formatCurrency(v: number) {
  // Подставь локаль/валюту из настроек пользователя
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}
