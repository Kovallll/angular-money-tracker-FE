import { CreateGoalItem, GoalItem, GoalsHttpService } from '@/shared';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/** Метка времени для сортировки: что свежее — updatedAt или createdAt. */
function getGoalFreshnessTs(g: GoalItem): number {
  const raw = g.updatedAt ?? g.createdAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Прогресс цели в процентах (0–100). Цель считается выполненной при 100. */
export function getGoalProgress(goal: GoalItem): number {
  const target = goal.goalBudget ?? 0;
  const current = goal.targetBudget ?? 0;
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

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

  public createGoal(goal: CreateGoalItem, opts?: { groupRoomId?: string }) {
    return this.goalsHttpService.createGoal(goal, opts).subscribe({
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
    return this.updateGoal$(id, goal).subscribe({
      error: () => {},
    });
  }

  /** Returns an Observable so callers can subscribe and handle loading state (e.g. quick-add). */
  public updateGoal$(
    id: number | string,
    goal: Partial<GoalItem> | CreateGoalItem,
  ): Observable<unknown> {
    return this.goalsHttpService.updateGoal(id, goal).pipe(
      tap(() => {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Goal updated',
          life: 3000,
        });
        this.goalsHttpService.loadGoals();
      }),
      catchError(() => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update goal',
          life: 4000,
        });
        return throwError(() => new Error('Failed to update goal'));
      }),
    );
  }

  public deleteGoal(id: number | string) {
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

  /**
   * Все цели (для страницы целей).
   * С сортировкой по свежести (updatedAt/createdAt), новое первое.
   */
  getGoals(): Signal<GoalItem[]>;
  /**
   * Цели для дашборда: только активные (прогресс < 100), по свежести, топ max.
   * Выполненные цели на дашборде не показываются.
   */
  getGoals(max: number): Signal<GoalItem[]>;
  getGoals(max?: number): Signal<GoalItem[]> {
    return computed(() => {
      const all = this.goals() ?? [];
      const onlyActive = max != null;
      const filtered = onlyActive ? all.filter((g) => getGoalProgress(g) < 100) : all;
      const sorted = [...filtered].sort((a, b) => {
        const tsA = getGoalFreshnessTs(a);
        const tsB = getGoalFreshnessTs(b);
        return tsB - tsA; // новое первое
      });
      return max != null ? sorted.slice(0, max) : sorted;
    });
  }

  /** Активные цели (прогресс < 100), по свежести. */
  getActiveGoals(): Signal<GoalItem[]> {
    return computed(() => {
      const all = this.goals() ?? [];
      const active = all.filter((g) => getGoalProgress(g) < 100);
      return [...active].sort((a, b) => getGoalFreshnessTs(b) - getGoalFreshnessTs(a));
    });
  }

  /** Выполненные цели (прогресс >= 100), по свежести. */
  getCompletedGoals(): Signal<GoalItem[]> {
    return computed(() => {
      const all = this.goals() ?? [];
      const completed = all.filter((g) => getGoalProgress(g) >= 100);
      return [...completed].sort((a, b) => getGoalFreshnessTs(b) - getGoalFreshnessTs(a));
    });
  }

  getGoal(id: number | string): Signal<GoalItem | undefined> {
    const idStr = String(id);
    return computed(() => this.goals().find((g) => String(g.id) === idStr));
  }
}
