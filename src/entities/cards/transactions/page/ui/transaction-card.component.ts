import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { tabs } from '@/shared';
import { TransactionsService } from '../../services/transactions.service';
import { TableComponent } from '@/entities/table/ui/table.component';

@Component({
  selector: 'transactions',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, MatTabsModule, TableComponent],
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  readonly title = 'Transactions';
  readonly tabs = tabs;

  readonly tabFilter = signal('All');

  readonly currentTransactions = computed(() =>
    this.tabFilter() === 'All'
      ? this.transactionsService.all
      : this.transactionsService.tabTransactions(this.tabFilter()),
  );

  constructor(private readonly transactionsService: TransactionsService) {}

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }

  get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  displayedCells = signal([
    { cellField: 'date', cellName: 'Date' },
    { cellField: 'title', cellName: 'Title' },
    { cellField: 'category', cellName: 'Category' },
    { cellField: 'type', cellName: 'Type' },
    { cellField: 'paymentMethod', cellName: 'Payment method' },
    { cellField: 'status', cellName: 'Status' },
    { cellField: 'transactionType', cellName: 'Transaction Type' },
    { cellField: 'receipt', cellName: 'Receipt' },
    { cellField: 'amount', cellName: 'Amount' },
  ]);
}
