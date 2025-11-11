import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, CardHeaderComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths, tabs, TransactionsHttpService } from '@/shared';
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
  readonly tabFilter = signal('All');
  readonly isLoading = this.transactionsHttpService.isLoading;
  readonly title = 'Recent Transaction';
  readonly tabs = tabs;
  readonly seeAllPath = RoutePaths.TRANSACTIONS;

  readonly currentItems = this.transactionsService.dashboardTransactions(this.tabFilter);

  constructor(private readonly transactionsService: DashboardTransactionsService) {}

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }
}
