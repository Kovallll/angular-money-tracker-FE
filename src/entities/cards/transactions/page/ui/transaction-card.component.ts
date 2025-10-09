import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { tabs, Transaction, UrlSyncedComponent } from '@/shared';
import { TransactionsService } from '../../services/transactions.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';

@Component({
  selector: 'transactions',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatTabsModule,
    TableComponent,
    ControlsComponent,
    PaginationComponent,
  ],
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent extends UrlSyncedComponent<Transaction> {
  private transactionsService = inject(TransactionsService);
  readonly tabs = tabs;

  readonly tabFilter = signal('All');

  readonly transactions = computed(() => this.transactionsService.getAllTransactions());

  protected base = computed(() =>
    this.tabFilter() === 'All'
      ? this.transactions()
      : this.transactions().filter((t) => t.type === this.tabFilter()),
  );

  allData = this.base;

  readonly currentTransactions = signal(this.base());

  readonly displayedCells = signal(this.transactionsService.getDisplayedCells());

  readonly controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.transactions(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'Search by title' },
  }));

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }

  override get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  override setUpdatedData(updatedData: Transaction[]): void {
    this.currentTransactions.set(updatedData);
  }
}
