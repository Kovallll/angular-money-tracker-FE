import { balancesUrl } from '@/shared/constants';
import { BalanceCard } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalancesHttpService {
  private http = inject(HttpClient);

  private cards$ = this.http
    .get<BalanceCard[]>(balancesUrl)
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly cards = toSignal(this.cards$, { initialValue: [] });

  getCard(id: number | null) {
    return this.http
      .get<BalanceCard>(`${balancesUrl}/${id}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
