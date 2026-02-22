import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, CardHeaderComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths, tabs, TransactionsHttpService } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { TransactionCardItemComponent } from './card-item/transaction-card-item.component';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'dash-transaction-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    MatTabsModule,
    TransactionCardItemComponent,
    ProgressSpinner,
  ],
  templateUrl: './transaction-card.html',
  styleUrls: ['./transaction-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTransactionCardComponent {
  private transactionsHttpService = inject(TransactionsHttpService);
  private transactionsService = inject(DashboardTransactionsService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  readonly tabFilter = signal('All');
  readonly isLoading = this.transactionsHttpService.isLoading;
  readonly title = 'Recent Transaction';
  readonly tabs = tabs;
  readonly seeAllPath = RoutePaths.TRANSACTIONS;

  private readonly rawItems = this.transactionsService.dashboardTransactions(this.tabFilter);
  readonly currentItems = computed(() => {
    const list = this.rawItems();
    const primary = this.currencyService.primaryCode();
    return list.map((t) => ({
      ...t,
      amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
    }));
  });

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }
}
