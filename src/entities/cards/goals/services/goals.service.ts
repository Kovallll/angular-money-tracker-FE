import { GoalItem, GoalsHttpService } from '@/shared';
import { computed, inject, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsHttpService = inject(GoalsHttpService);
  private goals = this.goalsHttpService.goals;

  getGoals(max?: number): Signal<GoalItem[]> {
    return computed(() => {
      const all = this.goals() ?? [];
      return max ? all.slice(0, max) : all;
    });
  }

  getGoal(id: number): Signal<GoalItem | undefined> {
    return computed(() => this.goals().find((g) => g.id === id));
  }
}
