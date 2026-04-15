import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { ExpenseCardItemComponent } from './card-item/expense-card-item.component';
import { ExpensesHttpService, RoutePaths } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dash-expense-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    ExpenseCardItemComponent,
    ProgressSpinner,
    AppIconComponent,
    TranslatePipe,
  ],
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

  /** Самый затратный расход в каждой категории, макс 6 карточек (в primary валюте). */
  expenses = computed(() => {
    const list = this.expesesHttpService.expenses();
    const primary = this.currencyService.primaryCode();

    const byCategory = new Map<string, (typeof list)[0]>();
    for (const e of list) {
      const key = String(e.category?.id ?? e.category?.title ?? e.id);
      const existing = byCategory.get(key);
      if (!existing || e.amount > existing.amount) {
        byCategory.set(key, e);
      }
    }

    const topByCategory = [...byCategory.values()].sort((a, b) => b.amount - a.amount).slice(0, 6);

    return topByCategory.map((e) => ({
      ...e,
      amount: this.exchangeRates.convert(e.amount, e.currencyCode ?? 'BYN', primary),
    }));
  });
}
