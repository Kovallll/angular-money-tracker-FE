import { BreakpointObserver } from '@angular/cdk/layout';
import { CategoryCardComponent } from '@/entities/cards/categories/page/ui/categories.component';
import { CategoriesHttpService, CategoryItem, UrlSyncedComponent } from '@/shared';
import { AuthService } from '@/shared/services/auth/auth.service';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GategoryAddButtonComponent } from '@/features/categories/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';

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
  ],
  standalone: true,
})
export class CategoriesCardsComponent extends UrlSyncedComponent<CategoryItem> {
  private categoriesHttpService = inject(CategoriesHttpService);
  private auth = inject(AuthService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private breakpointObserver = inject(BreakpointObserver);

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

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
    staleTime: 0,
    refetchOnMount: 'always',
  }));

  charts = injectQuery(() => ({
    queryKey: ['charts', this.auth.getCurrentUserId() ?? ''],
    queryFn: () =>
      this.categoriesHttpService.getCategoryExpenseLineCharts(
        new Date().getFullYear(),
        undefined,
        this.auth.getCurrentUserId() ?? undefined,
      ),
  }));

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

  getCurrentChart(id: number) {
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
