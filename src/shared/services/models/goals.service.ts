import { goalsUrl } from '@/shared/constants';
import { CreateGoalItem, GoalItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay, finalize, Observable, tap } from 'rxjs';
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

  /** Список целей комнаты (не трогает глобальный signal `goals`). */
  fetchGoalsForRoom(roomId: string): Observable<GoalItem[]> {
    return this.http.get<GoalItem[]>(`${goalsUrl}/room/${roomId}`);
  }

  createGoal(goal: CreateGoalItem, opts?: { groupRoomId?: string }) {
    const userId = this.auth.getCurrentUserId();
    const roomId = opts?.groupRoomId?.trim();
    if (!roomId && !userId) throw new Error('Not authenticated');
    const { title, targetBudget, goalBudget, startDate, endDate, currencyCode, categoryId } = goal;
    const body: Record<string, unknown> = {
      title,
      targetBudget,
      goalBudget,
      startDate,
      endDate,
      ...(currencyCode && { currencyCode }),
      ...(categoryId != null && categoryId !== '' && { categoryId }),
    };
    if (roomId) {
      body['groupRoomId'] = roomId;
    } else {
      body['userId'] = userId;
    }
    return this.http.post<GoalItem>(goalsUrl, body).pipe(tap(() => !roomId && this.loadGoals()));
  }

  deleteGoal(id: number | string) {
    return this.http.delete(`${goalsUrl}/${id}`);
  }

  updateGoal(id: number | string, goal: Partial<GoalItem> | CreateGoalItem) {
    const idStr = String(id);
    const g = goal as Partial<GoalItem>;
    const payload = {
      title: g.title,
      targetBudget: g.targetBudget,
      goalBudget: g.goalBudget,
      startDate: g.startDate,
      endDate: g.endDate,
      ...(g.status != null && { status: g.status }),
      ...(g.categoryId !== undefined && { categoryId: g.categoryId }),
    };
    return this.http.patch<CreateGoalItem>(`${goalsUrl}/${idStr}`, payload);
  }
}
