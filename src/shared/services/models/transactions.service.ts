import { transactionsUrl } from '@/shared/constants';
import { CreateTransaction, Transaction } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay, lastValueFrom, tap } from 'rxjs';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

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
      this.error.set('Не удалось загрузить транзакции');
    } finally {
      this.isLoading.set(false);
    }
  }

  getTransactions(userId: string) {
    return lastValueFrom(
      this.http.get<Transaction[]>(`${transactionsUrl}/user/${userId}`).pipe(delay(500)),
    );
  }

  async createTransaction(transaction: CreateTransaction) {
    const userId = this.auth.getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    this.isLoading.set(true);
    try {
      const created = await lastValueFrom(
        this.http.post<Transaction>(transactionsUrl, { ...transaction, userId }),
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
    return this.http
      .delete(`${transactionsUrl}/${id}`)
      .pipe(tap(() => this.loadTransactions()))
      .subscribe({
        error: () => this.isLoading.set(false),
      });
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
