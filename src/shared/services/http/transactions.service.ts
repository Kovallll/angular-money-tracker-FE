import { transactionsUrl } from '@/shared/constants';
import { CreateTransaction, Transaction } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay, lastValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionsHttpService {
  private http = inject(HttpClient);

  readonly transactions = signal<Transaction[]>([]);

  readonly isLoading = signal<boolean>(false);

  readonly error = signal<string | null>(null);

  constructor() {
    this.loadTransactions();
  }

  /** Загрузка всех транзакций */
  async loadTransactions() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.getTransactions();
      this.transactions.set(data);
    } catch (err: any) {
      console.error('Ошибка загрузки транзакций', err);
      this.error.set('Не удалось загрузить транзакции');
    } finally {
      this.isLoading.set(false);
    }
  }

  getTransactions() {
    return lastValueFrom(this.http.get<Transaction[]>(transactionsUrl).pipe(delay(500)));
  }

  async createTransaction(transaction: CreateTransaction) {
    this.isLoading.set(true);
    try {
      const created = await lastValueFrom(
        this.http.post<Transaction>(transactionsUrl, transaction),
      );
      this.transactions.update((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      this.error.set('Ошибка при создании транзакции');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  deleteTransaction(id: number) {
    this.isLoading.set(true);
    try {
      return this.http
        .delete(`${transactionsUrl}/${id}`)
        .pipe(tap(() => this.loadTransactions()))
        .subscribe();
    } catch (err: any) {
      this.error.set('Ошибка при удалении транзакции');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  updateTransaction(id: number, transaction: CreateTransaction) {
    this.isLoading.set(true);
    try {
      return this.http.patch<Transaction>(`${transactionsUrl}/${id}`, transaction);
    } catch (err: any) {
      this.error.set('Ошибка при обновлении транзакции');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
