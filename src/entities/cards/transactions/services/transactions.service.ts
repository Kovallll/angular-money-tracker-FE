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
    if (tab === Tabs.Transfers) return 'transfer';
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
      { field: 'date', name: 'txModal.date' },
      { field: 'title', name: 'common.title' },
      { field: 'category', name: 'txModal.category' },
      { field: 'type', name: 'txModal.type' },
      { field: 'paymentMethod', name: 'txModal.paymentMethod' },
      { field: 'amount', name: 'txModal.amount' },
    ];
  }
}
