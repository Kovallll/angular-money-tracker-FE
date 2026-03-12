import { transactionsUrl } from '@/shared/constants';
import { CreateTransaction, CreateTransactionPayload, Transaction } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay, lastValueFrom, tap } from 'rxjs';
import { AuthService } from '@/shared/services/auth/auth.service';
import { BalancesHttpService } from './balances.service';
import { StatisticsRefreshService } from './statistics-refresh.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private statisticsRefreshService = inject(StatisticsRefreshService);
  private balancesHttpService = inject(BalancesHttpService);

  readonly transactions = signal<Transaction[]>([]);

  readonly isLoading = signal<boolean>(false);

  readonly error = signal<string | null>(null);

  constructor() {
    this.loadTransactions();
  }

  /** Загрузка транзакций текущего пользователя */
  async loadTransactions() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      this.transactions.set([]);
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.getTransactions(userId);
      this.transactions.set(data);
    } catch (err: any) {
      console.error('Ошибка загрузки транзакций', err);
      this.error.set('Failed to load transactions');
    } finally {
      this.isLoading.set(false);
    }
  }

  getTransactions(userId: string) {
    return lastValueFrom(
      this.http.get<Transaction[]>(`${transactionsUrl}/user/${userId}`).pipe(delay(500)),
    );
  }

  async createTransaction(transaction: CreateTransaction | CreateTransactionPayload) {
    const userId = this.auth.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    this.isLoading.set(true);
    try {
      const created = await lastValueFrom(
        this.http.post<Transaction>(transactionsUrl, { ...transaction, userId }),
      );
      this.transactions.update((prev) => [...prev, created]);
      this.statisticsRefreshService.refresh();
      return created;
    } catch (err: any) {
      this.error.set('Error creating transaction');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  deleteTransaction(id: number) {
    this.isLoading.set(true);
    return this.http
      .delete(`${transactionsUrl}/${id}`)
      .pipe(
        tap(() => {
          this.balancesHttpService.refresh();
          this.loadTransactions();
          this.statisticsRefreshService.refresh();
        }),
      )
      .subscribe({
        error: () => this.isLoading.set(false),
      });
  }

  updateTransaction(id: number, transaction: CreateTransaction) {
    this.isLoading.set(true);
    try {
      return this.http.patch<Transaction>(`${transactionsUrl}/${id}`, transaction);
    } catch (err: any) {
      this.error.set('Error updating transaction');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
