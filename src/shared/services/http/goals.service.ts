import { goalsUrl } from '@/shared/constants';
import { GoalItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoalsHttpService {
  private http = inject(HttpClient);

  private goals$ = this.http.get<GoalItem[]>(goalsUrl).pipe(shareReplay(1));

  readonly goals = toSignal(this.goals$, { initialValue: [] });
}
