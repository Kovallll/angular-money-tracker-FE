import { generateTransactions, Tabs, Transaction } from '@/shared';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly transactions = generateTransactions().sort((a, b) =>
    dayjs(b.date).diff(dayjs(a.date)),
  );

  getAllTransactions() {
    return this.transactions;
  }

  tabTransactions(tabFilter: string) {
    return this.transactions.filter((t) => t.type === tabFilter);
  }

  dashboardTabTransactions(tabFilter: string) {
    return this.tabTransactions(tabFilter).slice(0, 9);
  }

  dashboardAllTransactions() {
    return this.getAllTransactions().slice(0, 9);
  }

  dashboardTransactions(tabFilter: string) {
    return tabFilter === Tabs.All
      ? this.dashboardAllTransactions()
      : this.dashboardTabTransactions(tabFilter);
  }

  getDisplayedCells() {
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

  getCurrentTransactions(tabFilter: string): Transaction[] {
    return tabFilter === Tabs.All ? this.getAllTransactions() : this.tabTransactions(tabFilter);
  }
}
