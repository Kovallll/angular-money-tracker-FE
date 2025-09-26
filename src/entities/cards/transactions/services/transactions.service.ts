import { Transaction, transactions } from '@/shared';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly _transactions = signal<Transaction[]>(transactions);

  get all() {
    return this._transactions.asReadonly();
  }

  get dashboard() {
    return this._transactions().slice(0, 9);
  }

  tabTransactions(tabFilter: string) {
    return this._transactions().filter((t) => t.type === tabFilter);
  }

  dashboardTabTransactions(tabFilter: string) {
    return this._transactions()
      .filter((t) => t.type === tabFilter)
      .slice(0, 9);
  }
}
