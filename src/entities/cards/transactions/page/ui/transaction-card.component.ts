import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatIconModule } from '@angular/material/icon';
import {
  BalancesHttpService,
  CategoriesHttpService,
  Tabs,
  tabs,
  Transaction,
  TransactionsHttpService,
  UrlSyncedComponent,
} from '@/shared';
import { GroupRoomsHttpService } from '@/shared/services/models';
import { mapGroupTxToTransaction } from '../../dashboard/ui/group-tx-map';
import { AuthService } from '@/shared/services/auth/auth.service';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { TransactionsListViewComponent } from '@/entities/transactions-list-view';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { TransactionAddButtonComponent } from '@/features/transactions/add-button/add-card.component';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTransactionModalComponent } from '@/features/transactions/edit-modal/edit-card-modal.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';

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
  providers: [DialogService, MessageService],
})
export class TransactionsComponent extends UrlSyncedComponent<Transaction> {
  private transactionsService = inject(DashboardTransactionsService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private groupRoomsHttp = inject(GroupRoomsHttpService);
  private queryClient = inject(QueryClient);
  private messageService = inject(MessageService);
  private balancesHttpService = inject(BalancesHttpService);
  private auth = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  ref: DynamicDialogRef | undefined | null;
  readonly tabs = tabs;

  /** Групповая комната: список общих транзакций вместо личных. */
  groupRoomId = input<string | undefined>(undefined);
  /** Скрыть заголовок страницы (вкладка внутри комнаты). */
  embedded = input(false);

  readonly tabFilter = signal('All');

  personalTxQuery = injectQuery(() => ({
    queryKey: ['transactions', this.auth.getCurrentUserId() ?? ''],
    queryFn: () => {
      const userId = this.auth.getCurrentUserId();
      if (!userId) return Promise.resolve([] as Transaction[]);
      return this.transactionsHttpService.getTransactions(userId);
    },
    enabled: !this.groupRoomId()?.trim(),
  }));

  groupTxQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['groupTransactions', rid] as const,
      queryFn: () => this.groupRoomsHttp.getRoomTransactions(rid),
      enabled: !!rid,
    };
  });

  roomCategoriesForTx = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['categories', 'scope', rid] as const,
      queryFn: () =>
        rid ? this.categoriesHttpService.fetchCategoriesByRoom(rid) : Promise.resolve([]),
      enabled: !!rid,
    };
  });

  readonly isLoadingForView = computed(() => {
    if (this.groupRoomId()?.trim()) {
      return this.groupTxQuery.isPending() || this.roomCategoriesForTx.isPending();
    }
    return this.transactionsHttpService.isLoading();
  });

  signalTransactions = computed((): Transaction[] => {
    const rid = this.groupRoomId()?.trim();
    if (rid) {
      const raw = this.groupTxQuery.data() ?? [];
      const cats = this.roomCategoriesForTx.data() ?? [];
      const catMap = new Map(cats.map((c) => [String(c.id), c]));
      return raw.map((g) => mapGroupTxToTransaction(g, catMap));
    }
    return this.personalTxQuery.data() ?? [];
  });

  /** Полный список с учётом фильтра по табу и сортировки по умолчанию (новые сверху). */
  readonly allData = computed(() => {
    const base = this.signalTransactions() ?? [];
    const tab = this.tabFilter();
    const apiType =
      tab === Tabs.All
        ? null
        : tab === Tabs.Expenses
          ? 'expense'
          : tab === Tabs.Transfers
            ? 'transfer'
            : 'revenue';
    const filtered = apiType == null ? [...base] : base.filter((t) => t.type === apiType);
    return [...filtered].sort((a, b) => {
      const timeA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : a.date
          ? new Date(a.date).getTime()
          : 0;
      const timeB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : b.date
          ? new Date(b.date).getTime()
          : 0;
      return timeB - timeA;
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
    const rid = this.groupRoomId()?.trim();
    const categories = rid
      ? (this.roomCategoriesForTx.data() ?? [])
      : this.categoriesHttpService.categories();
    return list.map((t) => {
      const fromApi = t.category != null && t.category !== '';
      const catById = categories.find((c) => String(c.id) === String(t.categoryId));
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

  readonly displayedCells = computed(() => {
    const base = this.transactionsService.displayedCells();
    if (!this.groupRoomId()?.trim()) return base;
    const idx = base.findIndex((c) => c.field === 'category');
    const insertAt = idx >= 0 ? idx + 1 : 2;
    return [
      ...base.slice(0, insertAt),
      { field: 'groupCreatedByName', name: 'Added by' },
      ...base.slice(insertAt),
    ];
  });

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
    const rid = this.groupRoomId()?.trim();
    const gtxId = (transaction as Transaction).groupTransactionId;
    if (rid && gtxId) {
      this.confirmationService.confirm({
        message: `Delete transaction «${transaction.title ?? '—'}»?`,
        header: 'Confirm deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: () => {
          this.groupRoomsHttp.deleteRoomTransaction(rid, gtxId).subscribe({
            next: () => {
              void this.queryClient.invalidateQueries({ queryKey: ['groupTransactions', rid] });
              void this.queryClient.invalidateQueries({ queryKey: ['charts', 'room', rid] });
              void this.queryClient.invalidateQueries({ queryKey: ['roomContributions', rid] });
              this.balancesHttpService.refresh();
              this.messageService.add({
                key: 'toast',
                severity: 'success',
                summary: 'Deleted',
                detail: 'Transaction removed',
                life: 3000,
              });
            },
            error: () => {
              this.messageService.add({
                key: 'toast',
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete transaction',
                life: 4000,
              });
            },
          });
        },
      });
      return;
    }
    if (rid) return;

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
    const rid = this.groupRoomId()?.trim();
    const original = this.currentTransactions().find((t) => t.id === transaction.id);
    if (!original) return;
    if (rid && !original.groupTransactionId) return;

    const data = rid ? { transaction: original, groupRoomId: rid } : original;
    this.ref = this.dialogService.open(EditTransactionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data,
    });
  }
}
