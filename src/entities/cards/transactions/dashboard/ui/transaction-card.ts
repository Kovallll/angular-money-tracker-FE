import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  DashboardCardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  SeeAllNavigation,
} from '../../../card';
import {
  CategoriesHttpService,
  RoutePaths,
  tabs,
  Transaction,
  TransactionsHttpService,
} from '@/shared';
import { GroupRoomsHttpService } from '@/shared/services/models';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { TransactionCardItemComponent } from './card-item/transaction-card-item.component';
import { DashboardTransactionsService } from '../../services/transactions.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { mapGroupTxToTransaction } from './group-tx-map';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'dash-transaction-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    TransactionCardItemComponent,
    ProgressSpinner,
    AppIconComponent,
  ],
  templateUrl: './transaction-card.html',
  styleUrls: ['./transaction-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTransactionCardComponent {
  private transactionsService = inject(DashboardTransactionsService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private groupRoomsHttp = inject(GroupRoomsHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  groupRoomId = input<string | undefined>(undefined);

  readonly seeAllNavigation = computed((): SeeAllNavigation | null => {
    const rid = this.groupRoomId()?.trim();
    if (!rid) return null;
    return {
      commands: ['/', RoutePaths.ROOM_DETAILS, rid],
      queryParams: { tab: 'transactions' },
    };
  });

  readonly tabFilter = signal('All');
  readonly title = 'Recent Transaction';
  readonly tabs = tabs;
  readonly seeAllPath = RoutePaths.TRANSACTIONS;

  private readonly personalRaw = this.transactionsService.dashboardTransactions(this.tabFilter);

  groupTxQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['groupTransactions', rid] as const,
      queryFn: () => this.groupRoomsHttp.getRoomTransactions(rid),
      enabled: !!rid,
    };
  });

  roomCategoriesQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['categories', 'scope', rid] as const,
      queryFn: () =>
        rid ? this.categoriesHttpService.fetchCategoriesByRoom(rid) : Promise.resolve([]),
      enabled: !!rid,
    };
  });

  readonly isLoading = computed(() => {
    if (this.groupRoomId()?.trim()) {
      return this.groupTxQuery.isPending() || this.roomCategoriesQuery.isPending();
    }
    return this.transactionsHttpService.isLoading();
  });

  private readonly groupMapped = computed((): (Transaction & { categoryIcon?: string })[] => {
    const raw = this.groupTxQuery.data() ?? [];
    const cats = this.roomCategoriesQuery.data() ?? [];
    const catMap = new Map(cats.map((c) => [String(c.id), c]));
    const mapped = raw.map((g) => {
      const t = mapGroupTxToTransaction(g, catMap);
      const icon =
        cats.find((c) => c.title === t.category)?.icon ??
        cats.find(
          (c) => String(c.title ?? '').toLowerCase() === String(t.category ?? '').toLowerCase(),
        )?.icon;
      return { ...t, categoryIcon: icon ?? 'category' };
    });
    const tab = this.tabFilter();
    const filtered =
      tab === 'All' || tab === 'Expenses' ? mapped : mapped.filter((t) => t.type === 'revenue');
    return filtered.slice(0, 6);
  });

  readonly currentItems = computed(() => {
    const primary = this.currencyService.primaryCode();
    const list = this.groupRoomId()?.trim() ? this.groupMapped() : this.personalRaw();
    return list.map((t) => ({
      ...t,
      amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
    }));
  });

  selectTab(tab: string) {
    this.tabFilter.set(tab);
  }
}
