import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatIconModule } from '@angular/material/icon';
import {
  CategoriesHttpService,
  Tabs,
  tabs,
  Transaction,
  TransactionsHttpService,
  UrlSyncedComponent,
} from '@/shared';
import { AuthService } from '@/shared/services/auth/auth.service';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { TransactionsListViewComponent } from '@/entities/transactions-list-view';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { TransactionAddButtonComponent } from '@/features/transactions/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTransactionModalComponent } from '@/features/transactions/edit-modal/edit-card-modal.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'transactions',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatIconModule,
    TransactionsListViewComponent,
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
  private categoriesHttpService = inject(CategoriesHttpService);
  private auth = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  ref: DynamicDialogRef | undefined | null;
  readonly tabs = tabs;

  readonly isLoading = this.transactionsHttpService.isLoading;

  readonly tabFilter = signal('All');

  transactions = injectQuery(() => ({
    queryKey: ['transactions', this.auth.getCurrentUserId()],
    queryFn: () => {
      const userId = this.auth.getCurrentUserId();
      if (!userId) return Promise.resolve([] as Transaction[]);
      return this.transactionsHttpService.getTransactions(userId);
    },
  }));
  signalTransactions = computed(() => this.transactions.data());

  /** Полный список с учётом фильтра по табу и сортировки по умолчанию (новые сверху). */
  readonly allData = computed(() => {
    const base = this.signalTransactions() ?? [];
    const tab = this.tabFilter();
    const apiType = tab === Tabs.All ? null : tab === Tabs.Expenses ? 'expense' : 'revenue';
    const filtered = apiType == null ? [...base] : base.filter((t) => t.type === apiType);
    return [...filtered].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  });

  readonly currentTransactions = signal<Transaction[]>([]);

  /** Transactions with amount converted to primary currency (reactive to header). */
  readonly transactionsInPrimary = computed(() => {
    const list = this.currentTransactions();
    const primary = this.currencyService.primaryCode();
    return list.map((t) => ({
      ...t,
      amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
    }));
  });

  /** Same as transactionsInPrimary with category title and icon (from API or categories list). */
  readonly transactionsForTable = computed(() => {
    const list = this.transactionsInPrimary();
    const categories = this.categoriesHttpService.categories();
    return list.map((t) => {
      const fromApi = t.category != null && t.category !== '';
      const catById = categories.find((c) => c.id === Number(t.categoryId));
      const title = fromApi ? t.category! : (catById?.title ?? '—');
      const catByTitle =
        !catById && title !== '—'
          ? categories.find((c) => c.title?.toLowerCase() === title.toLowerCase())
          : null;
      const cat = catById ?? catByTitle;
      const categoryIcon = cat?.icon ?? '';
      return { ...t, category: title, categoryIcon };
    });
  });

  constructor(public dialogService: DialogService) {
    super();
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

  selectTab(tab: string) {
    this.tabFilter.set(tab);
  }

  override get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  override setUpdatedData(updatedData: Transaction[]): void {
    this.currentTransactions.set([...updatedData]);
  }

  handleDelete(transaction: Transaction | { id: number; title?: string }) {
    this.confirmationService.confirm({
      message: `Delete transaction «${transaction.title ?? '—'}»?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.transactionsHttpService.deleteTransaction(transaction.id);
      },
    });
  }

  handleEdit(transaction: Transaction | { id: number }) {
    const original = this.currentTransactions().find((t) => t.id === transaction.id);
    if (!original) return;
    this.ref = this.dialogService.open(EditTransactionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: original,
    });
  }
}
