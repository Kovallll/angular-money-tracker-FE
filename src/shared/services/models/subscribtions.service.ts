import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, tap } from 'rxjs';
import { subscriptionsUrl } from '@/shared/constants';
import { SubscribeItem } from '@/shared/types';

@Injectable({
  providedIn: 'root',
})
export class SubscribtionsHttpService {
  private http = inject(HttpClient);

  private readonly _subscriptions$ = new BehaviorSubject<SubscribeItem[]>([]);

  readonly subscriptions = toSignal(this._subscriptions$, { initialValue: [] });
  constructor() {
    this.loadAll();
  }
  loadAll() {
    return this.http
      .get<SubscribeItem[]>(subscriptionsUrl)
      .pipe(tap((data) => this._subscriptions$.next(data)))
      .subscribe();
  }

  getById(id: number | string) {
    return this.http.get<SubscribeItem>(`${subscriptionsUrl}/${id}`);
  }

  create(payload: Omit<SubscribeItem, 'id'>) {
    return this.http.post<SubscribeItem>(subscriptionsUrl, payload).pipe(
      tap((created) => {
        const list = this._subscriptions$.value;
        this._subscriptions$.next([...list, created]);
      }),
    );
  }

  update(id: number | string, payload: Partial<SubscribeItem>) {
    return this.http.patch<SubscribeItem>(`${subscriptionsUrl}/${id}`, payload).pipe(
      tap((updated) => {
        const list = this._subscriptions$.value.map((item) =>
          item.id === updated.id ? updated : item,
        );
        this._subscriptions$.next(list);
      }),
    );
  }

  delete(id: number | string) {
    return this.http.delete<void>(`${subscriptionsUrl}/${id}`).pipe(
      tap(() => {
        const list = this._subscriptions$.value.filter((item) => item.id !== id);
        this._subscriptions$.next(list);
      }),
    );
  }
}
