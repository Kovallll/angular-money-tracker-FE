import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { BalancesHttpService, UrlSyncedComponent } from '@/shared';
import { ProgressSpinner } from 'primeng/progressspinner';
import { BalanceCard } from '@/shared/types';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { BalanceAddCardButtonComponent } from '@/features/balance/add-card-button/add-card.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { SortersField } from '@/entities/sorters/lib';
import { FiltersField } from '@/entities/filters/lib';
import { TranslateModule } from '@ngx-translate/core';

const CARDS_PAGE_SIZE = 6;
const CARD_CONTROLS_THRESHOLD = 6;

type CardWithSearch = BalanceCard & { searchText: string };

const balanceSortersFields: SortersField[] = [
  { field: 'cardName', name: 'balances.name' },
  { field: 'bankName', name: 'balances.bank' },
  { field: 'cardBalance', name: 'balances.balance' },
  { field: 'cardType', name: 'balances.accountType' },
];

const balanceFilterFields: FiltersField[] = [
  { field: 'cardType', name: 'balances.accountType' },
  { field: 'currencyCode', name: 'common.currency' },
];

const balanceSearchProps = {
  searchField: 'searchText',
  placeholder: 'search.byNameBankNumber',
};

@Component({
  selector: 'balance-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BalanceCardItemComponent,
    ProgressSpinner,
    ControlsComponent,
    PaginationComponent,
    BalanceAddCardButtonComponent,
    AppIconComponent,
    TranslateModule,
  ],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardComponent extends UrlSyncedComponent<CardWithSearch> {
  private balansesHttpService = inject(BalancesHttpService);
  title = 'Balances';
  cards = this.balansesHttpService.cards;
  isLoading = this.balansesHttpService.isLoading;

  /** Full list with searchText for URL sync (search/filter/sort/paginate). */
  override allData = computed(() => {
    return this.cards().map((c) => ({
      ...c,
      searchText: `${c.cardName ?? ''} ${c.bankName ?? ''} ${c.cardNumber ?? ''}`.toLowerCase(),
    }));
  });

  /** Shown list: synced result when > 6 cards. */
  displayedCards = signal<BalanceCard[]>([]);

  override get isEmpty() {
    return (this.displayedCards().length || this.cards().length) === 0;
  }

  showControls = computed(() => this.cards().length > CARD_CONTROLS_THRESHOLD);

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.allData(),
      filterFields: balanceFilterFields,
    },
    sortersProps: {
      sortersFields: balanceSortersFields,
    },
    searchProps: balanceSearchProps,
  }));

  constructor() {
    super();
    this.initPageSize(CARDS_PAGE_SIZE);
    effect(() => {
      this.cards();
      this.sync();
    });
  }

  override setUpdatedData(updatedData: CardWithSearch[]): void {
    this.displayedCards.set(updatedData);
  }

  /** Cards to render: when ≤ 6 show all, otherwise show paginated result. */
  cardsToShow = computed(() => {
    const list = this.cards();
    if (list.length <= CARD_CONTROLS_THRESHOLD) return list;
    return this.displayedCards();
  });
}
