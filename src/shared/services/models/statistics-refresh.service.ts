import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { CategoriesHttpService } from './categories.service';
import { ExpensesHttpService } from './expenses.service';

/**
 * Единая точка обновления при изменении транзакций.
 * Вызов refresh() инвалидирует кэши запросов (categories, charts, transactions),
 * обновляет сигналы категорий и расходов и триггерит перезапрос аналитики.
 */
@Injectable({ providedIn: 'root' })
export class StatisticsRefreshService {
  private readonly refresh$ = new Subject<void>();
  private readonly queryClient = inject(QueryClient);
  private readonly categoriesHttpService = inject(CategoriesHttpService);
  private readonly expensesHttpService = inject(ExpensesHttpService);

  /** Подписаться на запрос обновления графика аналитики. */
  get onRefresh() {
    return this.refresh$.asObservable();
  }

  /** Вызвать после добавления/изменения/удаления транзакции — все суммы пересчитаются. */
  refresh(): void {
    this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
    this.queryClient.invalidateQueries({ queryKey: ['categories'] });
    this.queryClient.invalidateQueries({ queryKey: ['charts'] });
    this.categoriesHttpService.refreshCategories();
    this.expensesHttpService.refreshExpenses();
    this.refresh$.next();
  }
}
