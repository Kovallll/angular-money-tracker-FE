import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, CardHeaderComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths, tabs, Transaction, TransactionsHttpService } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { TransactionCardItemComponent } from './card-item/transaction-card-item.component';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { EditTransactionModalComponent } from '@/features/transactions/edit-modal/edit-card-modal.component';

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
    ContextMenuComponent,
  ],
  templateUrl: './transaction-card.html',
  styleUrls: ['./transaction-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class DashboardTransactionCardComponent {
  private transactionsHttpService = inject(TransactionsHttpService);
  private transactionsService = inject(DashboardTransactionsService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);

  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;
  ref: DynamicDialogRef | null = null;

  readonly tabFilter = signal('All');
  readonly isLoading = this.transactionsHttpService.isLoading;
  readonly title = 'Recent Transaction';
  readonly tabs = tabs;
  readonly seeAllPath = RoutePaths.TRANSACTIONS;
  readonly selectedItem = signal<Transaction | null>(null);

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

  openContextMenu(event: MouseEvent, item: Transaction) {
    event.preventDefault();
    this.selectedItem.set(item);
    this.ctxMenu.open(event);
  }

  handleDelete(transaction: Transaction | null) {
    if (!transaction) return;
    this.confirmationService.confirm({
      message: `Delete transaction «${transaction.title}»?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.transactionsHttpService.deleteTransaction(transaction.id);
      },
    });
  }

  handleEdit(transaction: Transaction | null) {
    if (!transaction) return;
    const original = this.rawItems().find((t) => t.id === transaction.id) ?? transaction;
    this.ref = this.dialogService.open(EditTransactionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: original,
    });
  }
}
