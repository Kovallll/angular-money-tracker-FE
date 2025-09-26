import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, CardHeaderComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths, tabs } from '@/shared';
import { TransactionCardItemComponent } from './card-item/transaction-card-item.component';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'dash-transaction-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    MatTabsModule,
    TransactionCardItemComponent,
  ],
  templateUrl: './transaction-card.html',
  styleUrls: ['./transaction-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTransactionCardComponent {
  readonly tabFilter = signal('All');

  readonly title = 'Recent Transaction';
  readonly tabs = tabs;
  readonly seeAllPath = RoutePaths.TRANSACTIONS;

  readonly currentItems = computed(() =>
    this.tabFilter() === 'All'
      ? this.transactionsService.dashboard
      : this.transactionsService.dashboardTabTransactions(this.tabFilter()),
  );
  constructor(private readonly transactionsService: TransactionsService) {}

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }
}
