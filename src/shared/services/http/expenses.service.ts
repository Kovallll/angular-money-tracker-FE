import { ExpenseItem, expensesUrl } from '@/shared';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ExpensesHttpService {
  private http = inject(HttpClient);

  private expenses$ = this.http.get<ExpenseItem[]>(expensesUrl);

  readonly expenses = toSignal(this.expenses$, { initialValue: [] });
}
