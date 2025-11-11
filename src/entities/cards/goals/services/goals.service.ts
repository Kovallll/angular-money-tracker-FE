import { CreateGoalItem, GoalItem, GoalsHttpService } from '@/shared';
import { computed, inject, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsHttpService = inject(GoalsHttpService);
  private goals = this.goalsHttpService.goals;

  constructor() {
    this.goalsHttpService.loadGoals();
  }

  public createGoal(goal: CreateGoalItem) {
    return this.goalsHttpService.createGoal(goal);
  }

  public updateGoal(id: number, goal: CreateGoalItem) {
    return this.goalsHttpService
      .updateGoal(id, goal)
      .subscribe(() => this.goalsHttpService.loadGoals());
  }

  public deleteGoal(id: number) {
    return this.goalsHttpService.deleteGoal(id).subscribe(() => this.goalsHttpService.loadGoals());
  }

  public get isLoading() {
    return this.goalsHttpService.isLoading;
  }

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
