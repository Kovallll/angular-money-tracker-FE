import { ExpenseCardPageComponent } from '@/entities/cards/expenses/page/ui/expense-card.component';
import { CategoriesHttpService, TransactionsHttpService } from '@/shared';
import { Component, computed, inject } from '@angular/core';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { ExpensesStatisticCardComponent } from '@/entities/cards/statistics/ui/expenses/expenses-stats.component';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  standalone: true,
  selector: 'expenses-cards',
  templateUrl: './expensesCards.component.html',
  styleUrls: ['./expensesCards.component.scss'],
  imports: [
    ExpenseCardPageComponent,
    ExpensesStatisticCardComponent,
    AppCurrencyPipe,
    ProgressSpinner,
  ],
})
export class ExpensesCardsComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  /** Лоадер зависит от загрузки транзакций (расходы — часть транзакций). */
  isLoading = this.transactionsHttpService.isLoading;

  categories = this.categoriesHttpService.categories;
  hasAnyExpenses = computed(() => this.categories().some((c) => (c.expenses?.length ?? 0) > 0));

  totalExpenses = computed(() => {
    const raw = this.categories().reduce((sum, c) => sum + (c.totalExpenses ?? 0), 0);
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(raw, 'BYN', primary);
  });

  categoriesWithExpenses = computed(
    () => this.categories().filter((c) => (c.expenses?.length ?? 0) > 0).length,
  );

  totalTransactions = computed(() =>
    this.categories().reduce((sum, c) => sum + (c.expenses?.length ?? 0), 0),
  );
}
