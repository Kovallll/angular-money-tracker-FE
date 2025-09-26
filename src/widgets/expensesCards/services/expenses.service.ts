import { categories, expenses } from '@/shared';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  get categories() {
    return categories ?? [];
  }

  get expenses() {
    return expenses ?? [];
  }
}
