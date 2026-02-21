import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, tap, switchMap, of, combineLatest, startWith } from 'rxjs';
import { subscriptionsUrl } from '@/shared/constants';
import { SubscribeItem } from '@/shared/types';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubscribtionsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  private readonly _subscriptions$ = combineLatest([
    this.auth.user$,
    this.refresh$.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([user]) => {
      if (!user?.id) return of([] as SubscribeItem[]);
      return this.http.get<SubscribeItem[]>(`${subscriptionsUrl}/user/${user.id}`);
    }),
  );

  readonly subscriptions = toSignal(this._subscriptions$, { initialValue: [] as SubscribeItem[] });
  constructor() {}

  loadAll() {
    this.refresh$.next();
  }

  getById(id: number | string) {
    return this.http.get<SubscribeItem>(`${subscriptionsUrl}/${id}`);
  }

  create(payload: Omit<SubscribeItem, 'id'>) {
    const userId = this.auth.getCurrentUserId();
    return this.http
      .post<SubscribeItem>(subscriptionsUrl, { ...payload, userId })
      .pipe(tap(() => this.refresh$.next()));
  }

  update(id: number | string, payload: Partial<SubscribeItem>) {
    return this.http
      .patch<SubscribeItem>(`${subscriptionsUrl}/${id}`, payload)
      .pipe(tap(() => this.refresh$.next()));
  }

  delete(id: number | string) {
    return this.http
      .delete<void>(`${subscriptionsUrl}/${id}`)
      .pipe(tap(() => this.refresh$.next()));
  }
}
