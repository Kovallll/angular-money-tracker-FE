import { goalsUrl } from '@/shared/constants';
import { CreateGoalItem, GoalItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, finalize, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoalsHttpService {
  private http = inject(HttpClient);

  public isLoading = signal(false);
  public goals = signal<GoalItem[]>([]);

  loadGoals() {
    this.isLoading.set(true);

    this.http
      .get<GoalItem[]>(goalsUrl)
      .pipe(
        delay(500),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => this.goals.set(data.reverse()),
        error: () => this.goals.set([]),
      });
  }

  createGoal(goal: CreateGoalItem) {
    return this.http.post<CreateGoalItem>(goalsUrl, goal).subscribe(() => this.loadGoals());
  }

  deleteGoal(id: number) {
    return this.http.delete(`${goalsUrl}/${id}`);
  }

  updateGoal(id: number, goal: CreateGoalItem) {
    return this.http.patch<CreateGoalItem>(`${goalsUrl}/${id}`, goal);
  }
}
