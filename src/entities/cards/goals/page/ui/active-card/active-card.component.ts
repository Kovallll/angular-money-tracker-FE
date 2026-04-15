import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { DividerComponent } from '@/shared/components/divider/divider';
import { CardBodyComponent, DashboardCardComponent } from '@/entities/cards/card';
import { GoalAdjustCardButtonComponent } from '@/features/goal/adjust-goal-card/adjust-card.component';
import { GoalQuickAddFundsComponent } from '@/features/goal/quick-add-funds/quick-add-funds.component';
import { ChartData, ChartOptions } from 'chart.js';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

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
    GoalQuickAddFundsComponent,
    AppIconComponent,
    TranslateModule,
  ],
  templateUrl: './active-card.component.html',
  styleUrls: ['./active-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalActiveCardComponent {
  goal = input<any>();
  private i18n = inject(I18nService);

  private static readonly doughnutLabels = ['Target', 'Remaining'] as const;

  /**
   * Стабильная ссылка: не пересоздавать на каждом CD, иначе Chart.js/ng2-charts перерисовывает кольцо.
   */
  readonly chartOptions: ChartOptions<'doughnut'> = {
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: true,
    devicePixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1,
    plugins: { legend: { display: false } },
  };

  /** Данные графика только при смене цели / сумм — одна и та же ссылка при прочих кликах по странице. */
  readonly doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const item = this.goal();
    if (!item) {
      return {
        labels: [...GoalActiveCardComponent.doughnutLabels],
        datasets: [],
      };
    }
    const target = item.targetBudget ?? 0;
    const remaining = Math.max(0, (item.goalBudget ?? 0) - target);
    return {
      labels: [...GoalActiveCardComponent.doughnutLabels],
      datasets: [
        {
          backgroundColor: ['#3b82f6', 'rgba(59, 130, 246, 0.2)'],
          borderWidth: 0,
          hoverOffset: 4,
          spacing: 2,
          data: [target, remaining],
        },
      ],
    };
  });

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
    if (today < start) return this.i18n.t('goals.time.daysPassed', { count: 0 });
    const to = end && today > end ? end : today;
    const days = Math.floor((to.getTime() - start.getTime()) / 86400000);
    if (days >= 7) {
      const w = Math.floor(days / 7);
      return this.i18n.t('goals.time.weeksPassed', { count: w });
    }
    return this.i18n.t('goals.time.daysPassed', { count: days });
  }

  getTimeRemaining(item: { startDate?: string; endDate?: string }): string {
    const end = this.parseDate(item.endDate);
    if (!end) return this.i18n.t('goals.time.noDeadline');
    const today = this.todayStart();
    if (today >= end) return this.i18n.t('goals.time.ended');
    const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    if (days >= 7) {
      const w = Math.floor(days / 7);
      return this.i18n.t('goals.time.weeksLeft', { count: w });
    }
    return this.i18n.t('goals.time.daysLeft', { count: days });
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
}
