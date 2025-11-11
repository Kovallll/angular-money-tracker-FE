import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { Tabs, tabs, Transaction, TransactionsHttpService, UrlSyncedComponent } from '@/shared';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { TransactionAddButtonComponent } from '@/features/transactions/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { tap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTransactionModalComponent } from '@/features/transactions/edit-modal/edit-card-modal.component';
import { ProgressSpinner } from 'primeng/progressspinner';

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
    TransactionAddButtonComponent,
    ProgressSpinner,
  ],
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class TransactionsComponent extends UrlSyncedComponent<Transaction> {
  private transactionsService = inject(DashboardTransactionsService);
  private transactionsHttpService = inject(TransactionsHttpService);
  ref: DynamicDialogRef | undefined | null;
  readonly tabs = tabs;

  readonly isLoading = this.transactionsHttpService.isLoading;

  readonly tabFilter = signal('All');

  transactions = injectQuery(() => ({
    queryKey: ['transactions'],
    queryFn: () => this.transactionsHttpService.getTransactions(),
  }));
  signalTransactions = computed(() => this.transactions.data());
  readonly currentTransactions = signal<Transaction[]>([]);
  readonly allData = signal<Transaction[]>([]);

  constructor(public dialogService: DialogService) {
    super();
    effect(() => {
      const base = this.signalTransactions() ?? [];
      this.currentTransactions.set([...base]);
      this.allData.set([...base]);
    });
  }

  readonly displayedCells = signal(this.transactionsService.displayedCells());

  readonly controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.signalTransactions() ?? [],
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

  handleDelete(transaction: Transaction) {
    this.transactionsHttpService.deleteTransaction(transaction.id);
  }

  handleEdit(transaction: Transaction) {
    this.ref = this.dialogService.open(EditTransactionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: transaction,
    });
  }
}
