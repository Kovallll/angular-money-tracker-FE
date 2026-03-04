import { inject, Injectable, Signal, computed } from '@angular/core';
import { Tabs, Transaction, TransactionsHttpService } from '@/shared';

@Injectable({ providedIn: 'root' })
export class DashboardTransactionsService {
  private readonly http = inject(TransactionsHttpService);

  private readonly countOfTransactions = 6;

  private readonly all: Signal<Transaction[]> = this.http.transactions;

  /** Приводит значение таба к типу транзакции в API (expense/revenue). */
  private tabToApiType(tab: string): string | null {
    if (tab === Tabs.All) return null;
    if (tab === Tabs.Expenses) return 'expense';
    if (tab === Tabs.Revenue) return 'revenue';
    return null;
  }

  tabTransactions(tabFilter: Signal<string>): Signal<Transaction[]> {
    return computed(() => {
      const tab = tabFilter();
      const data = this.all();
      const apiType = this.tabToApiType(tab);
      return apiType == null ? data : data.filter((t) => t.type === apiType);
    });
  }

  dashboardTransactions(tabFilter: Signal<string>): Signal<Transaction[]> {
    const source = this.tabTransactions(tabFilter);
    return computed(() => source().slice(0, this.countOfTransactions));
  }

  displayedCells() {
    return [
      { field: 'date', name: 'Date' },
      { field: 'title', name: 'Title' },
      { field: 'category', name: 'Category' },
      { field: 'type', name: 'Type' },
      { field: 'paymentMethod', name: 'Payment method' },
      { field: 'amount', name: 'Amount' },
    ];
  }
}
