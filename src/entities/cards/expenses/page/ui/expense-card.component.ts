import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { CategoryItem } from '@/shared';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ExpenseCardItemComponent } from '../card-item/expense-card-item.component';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'expense-card',
  standalone: true,
  imports: [AppCurrencyPipe, ExpenseCardItemComponent, AppIconComponent],
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardPageComponent {
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  @Input({ required: true }) category: CategoryItem | null = null;

  /** Total expenses in primary currency (reactive to header). */
  displayTotalExpenses = computed(() => {
    const cat = this.category;
    if (!cat) return 0;
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(cat.totalExpenses ?? 0, 'BYN', primary);
  });

  /** Expense items with amounts in primary currency (reactive to header). */
  expenses = computed(() => {
    const cat = this.category;
    if (!cat) return [];
    const primary = this.currencyService.primaryCode();
    return cat.expenses.slice(0, 2).map((e) => ({
      id: e.id,
      title: e.title ?? (e as { description?: string }).description ?? '',
      amount: this.exchangeRates.convert(e.amount ?? 0, 'BYN', primary),
      date: e.date,
      category: {
        id: cat.id,
        title: cat.title,
        icon: cat.icon ?? '',
      },
    }));
  });
}
