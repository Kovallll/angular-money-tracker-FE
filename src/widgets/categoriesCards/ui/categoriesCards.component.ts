import { BreakpointObserver } from '@angular/cdk/layout';
import { CategoryCardComponent } from '@/entities/cards/categories/page/ui/categories.component';
import { CategoriesHttpService, CategoryItem, UrlSyncedComponent } from '@/shared';
import { AuthService } from '@/shared/services/auth/auth.service';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GategoryAddButtonComponent } from '@/features/categories/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { GroupRoomsHttpService } from '@/shared/services/models/group-rooms.service';
import { mergeContributorsForPrimary } from '@/widgets/roomMemberContributions/room-member-contributions.util';

const CATEGORY_PAGE_SIZE_WIDE = 9;
const CATEGORY_PAGE_SIZE_TWO_COLUMNS = 8;
const CATEGORY_DISPLAYED_FIELDS = [
  { field: 'title', name: 'Title' },
  { field: 'totalExpenses', name: 'Total expenses' },
];

/** Возвращает метку времени «первой активности»: что было раньше — создание категории или первая транзакция. */
function getFirstActivitySortKey(cat: CategoryItem): number {
  const createdStr = cat.createdAt;
  const updatedStr = cat.updatedAt;

  if (updatedStr) {
    return new Date(updatedStr).getTime();
  }

  if (createdStr) {
    return new Date(createdStr).getTime();
  }

  return 0;
}

function sortCategoriesByFirstActivity(list: CategoryItem[]): CategoryItem[] {
  return [...list].sort((a, b) => getFirstActivitySortKey(b) - getFirstActivitySortKey(a));
}

@Component({
  selector: 'categories-cards',
  templateUrl: './categories-cards.component.html',
  styleUrls: ['./categories-cards.component.scss'],
  imports: [
    CategoryCardComponent,
    AppCurrencyPipe,
    GategoryAddButtonComponent,
    CategoryAnaliticsComponent,
    ProgressSpinnerModule,
    ControlsComponent,
    PaginationComponent,
    AppIconComponent,
  ],
  standalone: true,
})
export class CategoriesCardsComponent extends UrlSyncedComponent<CategoryItem> {
  private categoriesHttpService = inject(CategoriesHttpService);
  private groupRoomsHttp = inject(GroupRoomsHttpService);
  private auth = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private breakpointObserver = inject(BreakpointObserver);

  groupRoomId = input<string | undefined>(undefined);
  embedded = input(false);

  /** При ширине ≤1440px карточки в 2 колонки — 8 на странице; иначе 9. */
  readonly isTwoColumns = toSignal(
    this.breakpointObserver.observe('(max-width: 1440px)').pipe(map((s) => s.matches)),
    { initialValue: true },
  );

  override pageSize = CATEGORY_PAGE_SIZE_TWO_COLUMNS;

  readonly allData = computed(() => sortCategoriesByFirstActivity(this.categories.data() ?? []));
  readonly currentCategories = signal<CategoryItem[]>([]);

  constructor() {
    super();
    effect(() => {
      const twoCols = this.isTwoColumns();
      this.pageSize = twoCols ? CATEGORY_PAGE_SIZE_TWO_COLUMNS : CATEGORY_PAGE_SIZE_WIDE;
      this.sync();
    });
  }

  categories = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['categories', 'scope', rid] as const,
      queryFn: () =>
        rid
          ? this.categoriesHttpService.fetchCategoriesByRoom(rid)
          : this.categoriesHttpService.getCategories(),
      staleTime: 0,
      refetchOnMount: 'always',
    };
  });

  charts = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    const uid = this.auth.getCurrentUserId() ?? '';
    const year = new Date().getFullYear();
    return {
      queryKey: rid ? (['charts', 'room', rid] as const) : (['charts', 'user', uid] as const),
      queryFn: () =>
        rid
          ? this.categoriesHttpService.getCategoryExpenseLineCharts(year, undefined, undefined, rid)
          : this.categoriesHttpService.getCategoryExpenseLineCharts(
              year,
              undefined,
              uid || undefined,
            ),
    };
  });

  roomContributions = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['roomContributions', rid] as const,
      queryFn: () => this.groupRoomsHttp.getRoomContributions(rid),
      enabled: !!rid,
    };
  });

  payerRowsForCategory(categoryId: string | number | undefined) {
    if (categoryId == null) return [];
    return this.payersForCategory().get(String(categoryId)) ?? [];
  }

  /** Разбивка по плательщикам для карточки категории (комната). */
  readonly payersForCategory = computed(() => {
    const rid = this.groupRoomId()?.trim();
    const data = this.roomContributions.data();
    if (!rid || !data?.byCategory?.length) {
      return new Map<string, Array<{ userId: string; name: string; amount: number }>>();
    }
    const primary = this.currencyService.primaryCode();
    const conv = (a: number, f: string, t: string) => this.exchangeRates.convert(a, f, t);
    const m = new Map<string, Array<{ userId: string; name: string; amount: number }>>();
    for (const b of data.byCategory) {
      const key = b.categoryId != null ? String(b.categoryId) : '';
      m.set(key, mergeContributorsForPrimary(b.members, primary, conv));
    }
    return m;
  });

  override setUpdatedData(updatedData: CategoryItem[]): void {
    this.currentCategories.set([...updatedData]);
  }

  override get isEmpty() {
    return this.currentCategories().length === 0;
  }

  readonly controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.categories.data() ?? [],
      filterFields: CATEGORY_DISPLAYED_FIELDS,
    },
    sortersProps: {
      sortersFields: CATEGORY_DISPLAYED_FIELDS,
    },
    searchProps: { searchField: 'title', placeholder: 'Search by name' },
  }));

  getCurrentChart(id: string | number) {
    return this.charts.data()?.find((c) => String(c.categoryId) === String(id));
  }

  overageDeltaCompare = computed(() =>
    this.categoriesHttpService.getOverageDeltaCompare(this.charts.data() ?? []),
  );

  /** Количество транзакций в самой активной категории. */
  topCategoryTransactions = computed(() =>
    this.categoriesHttpService.getTopTransactions(this.categories.data() ?? []),
  );

  /** Сумма расходов по всем категориям, сконвертированная в выбранную валюту. */
  totalExpenses = computed(() => {
    const raw = this.categoriesHttpService.getTotalExpenses(this.categories.data() ?? []);
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(raw, 'BYN', primary);
  });
}
