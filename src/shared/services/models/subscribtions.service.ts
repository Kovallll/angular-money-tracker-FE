import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  tap,
  switchMap,
  of,
  combineLatest,
  startWith,
  catchError,
  retry,
  timer,
  timeout,
  Observable,
} from 'rxjs';
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

  /** true пока идёт запрос списка подписок. */
  private readonly loadingSignal = signal(true);

  private readonly _subscriptions$ = combineLatest([
    this.auth.user$,
    this.refresh$.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([user]) => {
      if (!user?.id) {
        this.loadingSignal.set(false);
        return of([] as SubscribeItem[]);
      }
      this.loadingSignal.set(true);
      return this.http.get<SubscribeItem[]>(`${subscriptionsUrl}/user/${user.id}`).pipe(
        timeout(60000),
        retry({
          count: 2,
          delay: (err, retryCount) => {
            console.warn(
              `[Subscriptions] Request failed (attempt ${retryCount + 1}/3):`,
              err?.message,
            );
            return timer(2000 * (retryCount + 1));
          },
        }),
        tap(() => this.loadingSignal.set(false)),
        catchError((err) => {
          this.loadingSignal.set(false);
          console.error('[Subscriptions] Failed after retries:', err?.message || err);
          return of([] as SubscribeItem[]);
        }),
      );
    }),
  );

  readonly subscriptions = toSignal(this._subscriptions$, { initialValue: [] as SubscribeItem[] });
  readonly isLoading = this.loadingSignal.asReadonly();
  constructor() {}

  loadAll() {
    this.refresh$.next();
  }

  getById(id: number | string) {
    return this.http.get<SubscribeItem>(`${subscriptionsUrl}/${id}`);
  }

  create(payload: Omit<SubscribeItem, 'id'>, opts?: { groupRoomId?: string }) {
    const userId = this.auth.getCurrentUserId();
    const roomId = opts?.groupRoomId?.trim();
    const body: Record<string, unknown> = { ...payload };
    if (roomId) {
      body['groupRoomId'] = roomId;
      delete body['userId'];
    } else {
      if (!userId) throw new Error('Not authenticated');
      body['userId'] = userId;
    }
    return this.http
      .post<SubscribeItem>(subscriptionsUrl, body)
      .pipe(tap(() => !roomId && this.refresh$.next()));
  }

  fetchSubscriptionsForRoom(roomId: string): Observable<SubscribeItem[]> {
    return this.http.get<SubscribeItem[]>(`${subscriptionsUrl}/room/${roomId}`);
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
