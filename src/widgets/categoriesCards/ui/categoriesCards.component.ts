import { CategoryCardComponent } from '@/entities/cards/categories/page/ui/categories.component';
import { CategoriesHttpService } from '@/shared';
import { AuthService } from '@/shared/services/auth/auth.service';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { Component, computed, inject } from '@angular/core';
import { GategoryAddButtonComponent } from '@/features/categories/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';

@Component({
  selector: 'categories-cards',
  templateUrl: './categories-cards.component.html',
  styleUrls: ['./categories-cards.component.scss'],
  imports: [
    CategoryCardComponent,
    AppCurrencyPipe,
    GategoryAddButtonComponent,
    CategoryAnaliticsComponent,
    ProgressSpinnerModule,
  ],
  standalone: true,
})
export class CategoriesCardsComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  private auth = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  charts = injectQuery(() => ({
    queryKey: ['charts', this.auth.getCurrentUserId() ?? ''],
    queryFn: () =>
      this.categoriesHttpService.getCategoryExpenseLineCharts(
        new Date().getFullYear(),
        undefined,
        this.auth.getCurrentUserId() ?? undefined,
      ),
  }));

  getCurrentChart(id: number) {
    return this.charts.data()?.find((c) => String(c.categoryId) === String(id));
  }

  overageDeltaCompare = computed(() =>
    this.categoriesHttpService.getOverageDeltaCompare(this.charts.data() ?? []),
  );

  /** Количество транзакций в самой активной категории. */
  topCategoryTransactions = computed(() =>
    this.categoriesHttpService.getTopTransactions(this.categories.data() ?? []),
  );

  /** Сумма расходов по всем категориям, сконвертированная в выбранную валюту. */
  totalExpenses = computed(() => {
    const raw = this.categoriesHttpService.getTotalExpenses(this.categories.data() ?? []);
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(raw, 'BYN', primary);
  });
}
