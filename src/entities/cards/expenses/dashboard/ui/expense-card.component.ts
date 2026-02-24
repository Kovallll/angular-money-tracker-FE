import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { ExpenseCardItemComponent } from './card-item/expense-card-item.component';
import { ExpensesHttpService, RoutePaths } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'dash-expense-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, ExpenseCardItemComponent, ProgressSpinner],
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardExpenseCardComponent {
  private expesesHttpService = inject(ExpensesHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  seeAllPath = RoutePaths.EXPENSES;
  isLoading = this.expesesHttpService.isLoading;

  /** Expenses with amounts converted to current primary currency (reactive to header). */
  expenses = computed(() => {
    const list = this.expesesHttpService.expenses().slice(0, 6);
    const primary = this.currencyService.primaryCode();
    return list.map((e) => ({
      ...e,
      amount: this.exchangeRates.convert(e.amount, e.currencyCode ?? 'BYN', primary),
    }));
  });
}
