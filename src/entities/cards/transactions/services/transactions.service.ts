import { inject, Injectable, Signal, computed } from '@angular/core';
import { Tabs, Transaction, TransactionsHttpService } from '@/shared';

@Injectable({ providedIn: 'root' })
export class DashboardTransactionsService {
  private readonly http = inject(TransactionsHttpService);

  private readonly all: Signal<Transaction[]> = this.http.transactions;

  tabTransactions(tabFilter: Signal<string>): Signal<Transaction[]> {
    return computed(() => {
      const tab = tabFilter();
      const data = this.all();
      return tab !== Tabs.All ? data.filter((t) => t.type === tab) : data;
    });
  }

  dashboardTransactions(tabFilter: Signal<string>): Signal<Transaction[]> {
    const source = this.tabTransactions(tabFilter);
    return computed(() => source().slice(0, 9));
  }

  displayedCells() {
    return [
      { field: 'date', name: 'Date' },
      { field: 'title', name: 'Title' },
      { field: 'category', name: 'Category' },
      { field: 'type', name: 'Type' },
      { field: 'paymentMethod', name: 'Payment method' },
      { field: 'status', name: 'Status' },
      { field: 'transactionType', name: 'Transaction Type' },
      { field: 'receipt', name: 'Receipt' },
      { field: 'amount', name: 'Amount' },
    ];
  }
}
