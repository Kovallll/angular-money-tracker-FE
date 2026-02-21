import { goalsUrl } from '@/shared/constants';
import { CreateGoalItem, GoalItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, finalize, tap } from 'rxjs';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GoalsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  public isLoading = signal(false);
  public goals = signal<GoalItem[]>([]);

  loadGoals() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      this.goals.set([]);
      return;
    }
    this.isLoading.set(true);
    this.http
      .get<GoalItem[]>(`${goalsUrl}/user/${userId}`)
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
    const userId = this.auth.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    return this.http
      .post<CreateGoalItem>(goalsUrl, { ...goal, userId })
      .subscribe(() => this.loadGoals());
  }

  deleteGoal(id: number) {
    return this.http.delete(`${goalsUrl}/${id}`);
  }

  updateGoal(id: number, goal: CreateGoalItem) {
    return this.http.patch<CreateGoalItem>(`${goalsUrl}/${id}`, goal);
  }
}
