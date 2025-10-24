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
  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }

  getGoalsChartData() {
    const datasets = this.goals().map((goal) => {
      const startDays = dayjs(new Date()).diff(dayjs(), 'day');
      const endDays = dayjs(goal.endDate).diff(dayjs(), 'day');
      const daysLeft = endDays - startDays;
      const budgetLeft = goal.goalBudget - goal.targetBudget;
      return {
        label: goal.title,
        data: [
          {
            x: daysLeft,
            y: budgetLeft,
          },
        ],
        backgroundColor: this.getRandomColor(),
      };
    });

    return { datasets };
  }
}
