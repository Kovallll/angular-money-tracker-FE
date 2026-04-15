import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  CategoriesHttpService,
  CategoryItem,
  ExpenseItem,
  ExpensesHttpService,
  RoutePaths,
  UrlSyncedComponent,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import {
  TransactionsListViewComponent,
  type TransactionListRow,
} from '@/entities/transactions-list-view';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'expenses-details-page',
  imports: [
    RouterLink,
    TransactionsListViewComponent,
    DashboardCardComponent,
    CardBodyComponent,
    ControlsComponent,
    PaginationComponent,
    AppIconComponent,
    AppCurrencyPipe,
    TranslateModule,
  ],
  templateUrl: './expenses-details-page.html',
  styleUrl: `./expenses-details-page.scss`,
  standalone: true,
})
export class ExpensesDetailsPageComponent
  extends UrlSyncedComponent<ExpenseItem>
  implements OnInit
{
  private route = inject(ActivatedRoute);
  private expensesHttpService = inject(ExpensesHttpService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  readonly RoutePaths = RoutePaths;

  expenses = signal<ExpenseItem[]>([]);
  category = signal<CategoryItem | null>(null);

  /** Id категории из маршрута (expenses-details/:id). */
  private categoryId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? null)), {
    initialValue: null as string | null,
  });

  /** Все расходы, отфильтрованные по категории при переходе по карточке. */
  allData = computed(() => {
    const list = this.expensesHttpService.expenses() ?? [];
    const id = this.categoryId();
    if (!id) return list;
    return list.filter((e) => String(e.category?.id) === id);
  });

  /** Расходы с суммами в выбранной (primary) валюте для таблицы. */
  expensesInPrimaryCurrency = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.expenses().map((e) => ({
      ...e,
      amount: this.exchangeRates.convert(e.amount, e.currencyCode ?? 'BYN', primary),
      currencyCode: primary,
    }));
  });

  /** Данные для списка (таблица/карточки): совместимы с TransactionListRow. */
  expenseListRows = computed<TransactionListRow[]>(() =>
    this.expensesInPrimaryCurrency().map((e) => ({
      id: e.id,
      date: e.date,
      title: e.title,
      amount: e.amount,
      category: e.category?.title,
      categoryIcon: e.category?.icon,
    })),
  );

  /** Сумма всех расходов категории в выбранной валюте. */
  totalAmount = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.allData().reduce(
      (sum, e) => sum + this.exchangeRates.convert(e.amount, e.currencyCode ?? 'BYN', primary),
      0,
    );
  });

  /** Количество расходов в категории. */
  expenseCount = computed(() => this.allData().length);

  /** Средняя сумма расхода в выбранной валюте. */
  averageAmount = computed(() => {
    const n = this.expenseCount();
    if (n === 0) return 0;
    return this.totalAmount() / n;
  });

  override get isEmpty() {
    return this.expenses().length === 0;
  }

  constructor() {
    super();
    effect(() => {
      if (this.allData().length > 0) this.sync();
    });
    effect(() => {
      const id = this.categoryId();
      const categories = this.categoriesHttpService.categories();
      if (id && categories?.length) {
        const cat = categories.find((c) => String(c.id) === id) ?? null;
        this.category.set(cat);
        const numId = Number(id);
        if (!Number.isNaN(numId)) {
          this.categoriesHttpService.selectedCategoryId.set(numId);
        }
      }
    });
  }

  displayedCells = signal([
    { field: 'date', name: 'txModal.date' },
    { field: 'title', name: 'common.title' },
    { field: 'amount', name: 'txModal.amount' },
  ]);

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.allData(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'search.byTitle' },
  }));

  setUpdatedData(updatedData: ExpenseItem[]): void {
    this.expenses.set(updatedData);
  }

  override ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const categoryId = params['id'];
      if (!categoryId) return;
      const numId = Number(categoryId);
      if (!Number.isNaN(numId)) {
        this.categoriesHttpService.selectedCategoryId.set(numId);
      }
    });
  }
}
