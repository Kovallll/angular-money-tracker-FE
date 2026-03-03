import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { CategoryItem, RoutePaths } from '@/shared';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ExpenseCardItemComponent } from '../card-item/expense-card-item.component';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  @Input({ required: true }) category: CategoryItem | null = null;

  handleCardClick() {
    const id = this.category?.id;
    if (id != null) {
      this.router.navigate([RoutePaths.EXPENSES_DETAILS, id]);
    }
  }

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

  /** Сравнение с прошлым месяцем: процент и направление (для расходов рост = плохо, красная стрелка вверх).
   * Если данных для сравнения недостаточно (нет трат в прошлом месяце или вообще нет трат),
   * показываем N/A и не подсвечиваем тренд.
   */
  compareToLastMonth = computed(() => {
    const cat = this.category;
    if (!cat?.expenses?.length) return { value: 0, isIncrease: false, comparable: false };
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const byMonth = (e: { date?: string; amount?: number }) => {
      const d = e.date ? String(e.date).slice(0, 7) : '';
      return d;
    };

    const primary = this.currencyService.primaryCode();

    // currentMonthKey = текущий месяц (напр. 2026-03), previousMonthKey = прошлый (напр. 2026-02)
    const thisMonthSum = cat.expenses
      .filter((e) => byMonth(e) === currentMonthKey)
      .reduce(
        (sum, e) =>
          sum + this.exchangeRates.convert(e.amount ?? 0, e.currencyCode ?? 'BYN', primary),
        0,
      );
    const lastMonthSum = cat.expenses
      .filter((e) => byMonth(e) === previousMonthKey)
      .reduce(
        (sum, e) =>
          sum + this.exchangeRates.convert(e.amount ?? 0, e.currencyCode ?? 'BYN', primary),
        0,
      );

    // N/A, если в одном из месяцев нет транзакций: не показываем 0%, 100% или -100%
    if (lastMonthSum === 0 || thisMonthSum === 0) {
      return { value: 0, isIncrease: false, comparable: false };
    }

    // Рост расходов (thisMonth > lastMonth) → положительный %, стрелка вверх (плохо)
    const changePct = ((thisMonthSum - lastMonthSum) / lastMonthSum) * 100;
    if (!Number.isFinite(changePct)) {
      return { value: 0, isIncrease: false, comparable: false };
    }
    const value = Math.abs(Math.round(changePct * 100) / 100);
    const isIncrease = changePct > 0; // true = расходы выросли → красный и стрелка вверх
    return { value, isIncrease, comparable: true };
  });
}
