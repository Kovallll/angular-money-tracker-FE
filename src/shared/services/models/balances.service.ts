import { balancesUrl } from '@/shared/constants';
import { BalanceCard, CreateCard } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap, tap, catchError, Subject, of, combineLatest } from 'rxjs';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class BalancesHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly refresh$ = new Subject<void>();

  private readonly cards$ = combineLatest([
    this.auth.user$,
    this.refresh$.pipe(startWith(void 0)),
  ]).pipe(
    switchMap(([user]) => {
      if (!user?.id) return of([] as BalanceCard[]);
      return this.http.get<BalanceCard[]>(`${balancesUrl}/user/${user.id}`);
    }),
  );

  readonly cards = toSignal(this.cards$, { initialValue: [] as BalanceCard[] });

  refresh() {
    this.refresh$.next();
  }

  createCard(card: CreateCard) {
    const userId = this.auth.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    return this.http.post<BalanceCard>(balancesUrl, { ...card, userId }).pipe(
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
