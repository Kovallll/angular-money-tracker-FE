import { GoalItem } from '@/shared';
import { GoalsHttpService } from '@/shared';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class GoalsStatisticsService {
  private goalsHttpService = inject(GoalsHttpService);
  private goals = this.goalsHttpService.goals;

  constructor() {
    this.goalsHttpService.loadGoals();
  }

  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;
  }

  getGoalsChartData() {
    const rawData = this.goals()
      .filter((goal) => goal.startDate && goal.endDate)
      .map((goal) => {
        const end = dayjs(goal.endDate);
        const today = dayjs();

        const daysLeft = Math.max(end.diff(today, 'day'), 0);
        const budgetLeft = Math.max(Number(goal.goalBudget) - Number(goal.targetBudget), 0);

        return {
          label: goal.title,
          daysLeft,
          budgetLeft,
        };
      });

    // Выбросы: уберём верхние 2% самых больших значений
    const budgets = rawData.map((r) => r.budgetLeft);
    const sorted = [...budgets].sort((a, b) => a - b);
    const cutoff = sorted[Math.floor(sorted.length * 0.98)] || 1000;

    const datasets = rawData.map((goal) => ({
      label: goal.label,
      data: [{ x: goal.daysLeft, y: Math.min(goal.budgetLeft, cutoff) }],
      backgroundColor: this.getRandomColor(),
      borderWidth: 0,
    }));

    return { datasets };
  }
}
