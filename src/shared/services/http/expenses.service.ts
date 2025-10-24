import { categoriesUrl, CategoryItem, ExpenseItem, expensesUrl } from '@/shared';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ExpensesHttpService {
  private http = inject(HttpClient);

  private categories$ = this.http.get<CategoryItem[]>(categoriesUrl).pipe(shareReplay(1));

  private expenses$ = this.http.get<ExpenseItem[]>(expensesUrl).pipe(shareReplay(1));

  readonly categories = toSignal(this.categories$, { initialValue: [] });
  readonly expenses = toSignal(this.expenses$, { initialValue: [] });

  readonly selectedCategoryId = signal<number | null>(null);

  readonly currentCategory = computed(() => {
    const id = this.selectedCategoryId();
    return this.categories().find((c) => c.id === id) ?? null;
  });
}
