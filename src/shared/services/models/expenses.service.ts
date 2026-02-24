import { AuthService } from '@/shared/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, forkJoin, map, tap, catchError } from 'rxjs';
import { Transaction } from '@/shared/types';
import { CategoryItem } from '@/shared';

@Injectable({
  providedIn: 'root',
})
export class ExpensesHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly loadingSignal = signal(true);

  private expenses$ = this.auth.user$.pipe(
    switchMap((user) => {
      if (!user?.id) {
        this.loadingSignal.set(false);
        return of([]);
      }
      this.loadingSignal.set(true);
      return forkJoin({
        transactions: this.http.get<Transaction[]>(`transactions/user/${user.id}`, {
          params: { type: 'expense' },
        }),
        categories: this.http.get<CategoryItem[]>(`categories/user/${user.id}`),
      }).pipe(
        map(({ transactions, categories }) => {
          const byId: Record<string, string> = {};
          const iconById: Record<string, string> = {};
          categories.forEach((c) => {
            byId[c.id] = c.title;
            iconById[c.id] = c.icon ?? '';
          });
          return transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            currencyCode: t.currencyCode ?? 'BYN',
            date: t.date,
            title: t.title ?? (t as { description?: string }).description ?? '',
            category: {
              id: t.categoryId,
              title: byId[t.categoryId] ?? '—',
              icon: iconById[t.categoryId] ?? '',
            },
          }));
        }),
        tap(() => this.loadingSignal.set(false)),
        catchError(() => {
          this.loadingSignal.set(false);
          return of([]);
        }),
      );
    }),
  );

  readonly expenses = toSignal(this.expenses$, { initialValue: [] });
  readonly isLoading = this.loadingSignal.asReadonly();
}
