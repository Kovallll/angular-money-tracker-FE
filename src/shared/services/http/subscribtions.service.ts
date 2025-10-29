import { subscriptionsUrl } from '@/shared/constants';
import { SubscribeItem } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SubscribtionsHttpService {
  private http = inject(HttpClient);

  private subscribtions$ = this.http.get<SubscribeItem[]>(subscriptionsUrl);

  readonly subscribtions = toSignal(this.subscribtions$, { initialValue: [] });
}
