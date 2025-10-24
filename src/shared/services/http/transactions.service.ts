import { transactionsUrl } from '@/shared/constants';
import { Transaction } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionsHttpService {
  private http = inject(HttpClient);

  private transactions$ = this.http.get<Transaction[]>(transactionsUrl).pipe(shareReplay(1));

  readonly transactions = toSignal(this.transactions$, { initialValue: [] });
}
