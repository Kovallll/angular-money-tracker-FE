import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import {
  CategoriesHttpService,
  CategoryItem,
  ExpenseItem,
  ExpensesHttpService,
  UrlSyncedComponent,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';

@Component({
  selector: 'expenses-details-page',
  imports: [
    TableComponent,
    DashboardCardComponent,
    CardBodyComponent,
    ControlsComponent,
    PaginationComponent,
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

  expenses = signal<ExpenseItem[]>([]);
  category = signal<CategoryItem | null>(null);

  /** Расходы с суммами в выбранной (primary) валюте для таблицы. */
  expensesInPrimaryCurrency = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.expenses().map((e) => ({
      ...e,
      amount: this.exchangeRates.convert(e.amount, e.currencyCode ?? 'BYN', primary),
      currencyCode: primary,
    }));
  });

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

  override get isEmpty() {
    return this.expenses().length === 0;
  }

  constructor() {
    super();
    effect(() => {
      if (this.allData().length > 0) this.sync();
    });
  }

  displayedCells = signal([
    { field: 'date', name: 'Date' },
    { field: 'title', name: 'Title' },
    { field: 'amount', name: 'Amount' },
  ]);

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.allData(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'Search by title' },
  }));

  setUpdatedData(updatedData: ExpenseItem[]): void {
    this.expenses.set(updatedData);
  }

  override ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const categoryId = params['id'];
      if (!categoryId) return;
      this.categoriesHttpService.selectedCategoryId.set(categoryId);
      const category = this.categoriesHttpService.currentCategory();
      this.category.set(category ?? null);
    });
  }
}
