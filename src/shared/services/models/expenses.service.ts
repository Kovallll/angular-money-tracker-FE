import { AuthService } from '@/shared/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, forkJoin, map } from 'rxjs';
import { Transaction } from '@/shared/types';
import { CategoryItem } from '@/shared';

@Injectable({
  providedIn: 'root',
})
export class ExpensesHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private expenses$ = this.auth.user$.pipe(
    switchMap((user) => {
      if (!user?.id) return of([]);
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
            title: t.title ?? '',
            category: {
              id: t.categoryId,
              title: byId[t.categoryId] ?? '—',
              icon: iconById[t.categoryId] ?? '',
            },
          }));
        }),
      );
    }),
  );

  readonly expenses = toSignal(this.expenses$, { initialValue: [] });
}
