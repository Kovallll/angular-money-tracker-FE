import { generateTransactions, Tabs } from '@/shared';
import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly transactions = generateTransactions()
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
    .slice(0, 9);

  get all() {
    return this.transactions;
  }

  tabTransactions(tabFilter: string) {
    return this.transactions.filter((t) => t.type === tabFilter);
  }

  dashboardTabTransactions(tabFilter: string) {
    return this.tabTransactions(tabFilter);
  }

  dashboardAllTransactions() {
    return this.all;
  }

  dashboardTransactions(tabFilter: string) {
    return tabFilter === Tabs.All
      ? this.dashboardAllTransactions()
      : this.dashboardTabTransactions(tabFilter);
  }
}
