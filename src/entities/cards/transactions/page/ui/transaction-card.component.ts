import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { Tabs, tabs, Transaction, UrlSyncedComponent } from '@/shared';
import { DashboardTransactionsService } from '../../services/transactions.service';
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
  private transactionsService = inject(DashboardTransactionsService);
  readonly tabs = tabs;

  readonly tabFilter = signal('All');

  readonly transactions = this.transactionsService.tabTransactions(this.tabFilter);

  readonly currentTransactions = signal<Transaction[]>([]);
  readonly allData = signal<Transaction[]>([]);

  constructor() {
    super();
    effect(() => {
      const base = this.transactions();
      this.currentTransactions.set([...base]);
      this.allData.set([...base]);
    });
  }

  readonly displayedCells = signal(this.transactionsService.displayedCells());

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
    this.tabFilter.set(this.tabs[index] ?? Tabs.All);
  }

  override get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  override setUpdatedData(updatedData: Transaction[]): void {
    this.currentTransactions.set([...updatedData]);
  }
}
