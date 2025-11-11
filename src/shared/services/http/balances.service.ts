import { balancesUrl } from '@/shared/constants';
import { BalanceCard, CreateCard } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap, tap, catchError, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BalancesHttpService {
  private http = inject(HttpClient);

  // триггер для перезагрузки
  private readonly refresh$ = new Subject<void>();

  private readonly cards$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.http.get<BalanceCard[]>(balancesUrl)),
  );

  readonly cards = toSignal(this.cards$, { initialValue: [] as BalanceCard[] });

  refresh() {
    this.refresh$.next();
  }

  createCard(card: CreateCard) {
    return this.http.post<BalanceCard>(balancesUrl, card).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        throw err;
      }),
    );
  }

  getCard(id: number | null) {
    return this.http.get<BalanceCard>(`${balancesUrl}/${id}`);
  }

  updateCard(id: number, card: CreateCard) {
    return this.http.patch<BalanceCard>(`${balancesUrl}/${id}`, card).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        throw err;
      }),
    );
  }

  deleteCard(id: number) {
    return this.http.delete(`${balancesUrl}/${id}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        throw err;
      }),
    );
  }
}
