import { goalsUrl } from '@/shared/constants';
import { GoalItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class GoalsHttpService {
  private http = inject(HttpClient);

  private goals$ = this.http.get<GoalItem[]>(goalsUrl);

  readonly goals = toSignal(this.goals$, { initialValue: [] });
}
