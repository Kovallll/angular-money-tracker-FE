import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { DividerComponent } from '@/shared/components/divider/divider';
import { CardBodyComponent, DashboardCardComponent } from '@/entities/cards/card';
import { GoalAdjustCardButtonComponent } from '@/features/goal/adjust-goal-card/adjust-card.component';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'goal-active-card',
  standalone: true,
  imports: [
    CommonModule,
    AppCurrencyPrimaryPipe,
    DatePipe,
    BaseChartDirective,
    DividerComponent,
    DashboardCardComponent,
    CardBodyComponent,
    GoalAdjustCardButtonComponent,
  ],
  templateUrl: './active-card.component.html',
  styleUrls: ['./active-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalActiveCardComponent {
  goal = input<any>();
  labels = ['Target', 'Remaining'];

  chartOptions: ChartOptions<'doughnut'> = {
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
  };

  getProgress(item: { targetBudget?: number; goalBudget?: number }): number {
    const goal = item.goalBudget ?? 0;
    const target = item.targetBudget ?? 0;
    if (goal <= 0) return 0;
    return Math.min(100, (target / goal) * 100);
  }

  getTimeElapsed(item: { startDate?: string; endDate?: string }): string {
    const start = this.parseDate(item.startDate);
    const end = this.parseDate(item.endDate);
    if (!start) return '';
    const today = this.todayStart();
    if (today < start) return '0 days passed';
    const to = end && today > end ? end : today;
    const days = Math.floor((to.getTime() - start.getTime()) / 86400000);
    if (days >= 7) {
      const w = Math.floor(days / 7);
      return `${w} ${w === 1 ? 'week' : 'weeks'} passed`;
    }
    return `${days} ${days === 1 ? 'day' : 'days'} passed`;
  }

  getTimeRemaining(item: { startDate?: string; endDate?: string }): string {
    const end = this.parseDate(item.endDate);
    if (!end) return 'No deadline';
    const today = this.todayStart();
    if (today >= end) return 'Ended';
    const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    if (days >= 7) {
      const w = Math.floor(days / 7);
      return `${w} ${w === 1 ? 'week' : 'weeks'} left`;
    }
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  }

  private parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d;
  }

  private todayStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getDataset(item: any) {
    const target = item.targetBudget ?? 0;
    const remaining = Math.max(0, (item.goalBudget ?? 0) - target);
    return [
      {
        backgroundColor: ['#3b82f6', 'rgba(59, 130, 246, 0.2)'],
        borderWidth: 0,
        hoverOffset: 4,
        spacing: 2,
        data: [target, remaining],
      },
    ];
  }
}
