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

  /** 2 самых дорогих расхода в категории по убыванию суммы (в primary валюте). */
  expenses = computed(() => {
    const cat = this.category;
    if (!cat?.expenses?.length) return [];
    const primary = this.currencyService.primaryCode();
    const sorted = [...cat.expenses].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)).slice(0, 2);
    return sorted.map((e) => ({
      id: e.id,
      title: e.title ?? (e as { description?: string }).description ?? '',
      amount: this.exchangeRates.convert(e.amount ?? 0, e.currencyCode ?? 'BYN', primary),
      date: e.date,
      category: {
        id: cat.id,
        title: cat.title,
        icon: cat.icon ?? '',
      },
    }));
  });

  /** Сравнение с прошлым месяцем: процент и направление (для расходов рост = плохо, красная стрелка вверх). */
  compareToLastMonth = computed(() => {
    const cat = this.category;
    if (!cat?.expenses?.length) return { value: 0, isIncrease: false };
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const byMonth = (e: { date?: string; amount?: number }) => {
      const d = e.date ? String(e.date).slice(0, 7) : '';
      return d;
    };
    const current = cat.expenses
      .filter((e) => byMonth(e) === currentMonthKey)
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const previous = cat.expenses
      .filter((e) => byMonth(e) === previousMonthKey)
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);

    if (previous === 0) return { value: 0, isIncrease: false };
    const changePct = ((current - previous) / previous) * 100;
    const value = Math.abs(Math.round(changePct * 100) / 100);
    return { value, isIncrease: changePct > 0 };
  });
}
