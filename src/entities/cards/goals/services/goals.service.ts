import { CreateGoalItem, GoalItem, GoalsHttpService } from '@/shared';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private goalsHttpService = inject(GoalsHttpService);
  private messageService = inject(MessageService);
  private goals = this.goalsHttpService.goals;

  constructor() {
    this.goalsHttpService.loadGoals();
  }

  public createGoal(goal: CreateGoalItem) {
    return this.goalsHttpService.createGoal(goal).subscribe({
      next: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Goal created',
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create goal',
          life: 4000,
        });
      },
    });
  }

  public updateGoal(id: number | string, goal: Partial<GoalItem> | CreateGoalItem) {
    return this.goalsHttpService.updateGoal(id, goal).subscribe({
      next: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Goal updated',
          life: 3000,
        });
        this.goalsHttpService.loadGoals();
      },
      error: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update goal',
          life: 4000,
        });
      },
    });
  }

  public deleteGoal(id: number) {
    return this.goalsHttpService.deleteGoal(id).subscribe({
      next: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Goal deleted',
          life: 3000,
        });
        this.goalsHttpService.loadGoals();
      },
      error: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete goal',
          life: 4000,
        });
      },
    });
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
