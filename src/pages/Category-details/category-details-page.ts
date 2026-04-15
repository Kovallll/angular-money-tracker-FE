import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CategoriesHttpService,
  CategoryItem,
  CategoryLineChartDto,
  RoutePaths,
  Transaction,
  UrlSyncedComponent,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import {
  TransactionsListViewComponent,
  type TransactionListRow,
} from '@/entities/transactions-list-view';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { TableCell } from '@/entities/table/lib';
import { ControlsProps } from '@/widgets/controls/lib';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '@/shared/services/auth/auth.service';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';

/** Транзакция с amount в primary валюте для отображения */
interface TransactionDisplay extends Transaction {
  amount: number;
}

@Component({
  selector: 'category-details-page',
  imports: [
    RouterLink,
    TransactionsListViewComponent,
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    PaginationComponent,
    AppIconComponent,
    AppCurrencyPipe,
    ControlsComponent,
    ProgressSpinner,
    TranslateModule,
  ],
  templateUrl: './category-details-page.html',
  styleUrl: './category-details-page.scss',
  standalone: true,
})
export class CategoryDetailsPageComponent
  extends UrlSyncedComponent<TransactionDisplay>
  implements OnInit
{
  private route = inject(ActivatedRoute);
  private categoriesHttpService = inject(CategoriesHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private auth = inject(AuthService);

  readonly RoutePaths = RoutePaths;

  category = signal<CategoryItem | null>(null);
  chart = signal<CategoryLineChartDto | null>(null);
  transactions = signal<TransactionDisplay[]>([]);

  private routeId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? null)), {
    initialValue: null as string | null,
  });

  categoriesQuery = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  chartsQuery = injectQuery(() => ({
    queryKey: ['charts', this.auth.getCurrentUserId() ?? ''],
    queryFn: () =>
      this.categoriesHttpService.getCategoryExpenseLineCharts(
        new Date().getFullYear(),
        undefined,
        this.auth.getCurrentUserId() ?? undefined,
      ),
  }));

  allData = computed(() => {
    const cat = this.category();
    if (!cat) return [];
    const primary = this.currencyService.primaryCode();
    const merged: TransactionDisplay[] = [
      ...(cat.expenses ?? []).map((t) => ({
        ...t,
        amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
      })),
      ...(cat.revenues ?? []).map((t) => ({
        ...t,
        amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
      })),
    ];
    return merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  });

  override get isEmpty() {
    return this.transactions().length === 0;
  }

  displayTotalExpenses = computed(() => {
    const cat = this.category();
    if (!cat) return 0;
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(cat.totalExpenses ?? 0, 'BYN', primary);
  });

  displayTotalRevenues = computed(() => {
    const cat = this.category();
    if (!cat) return 0;
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(cat.totalRevenues ?? 0, 'BYN', primary);
  });

  compareDelta = computed(() => {
    const ch = this.chart();
    return this.categoriesHttpService.getChartDeltaCompare(ch ?? undefined);
  });

  /** Дата последней транзакции в категории (для страницы деталей). */
  lastActivityDate = computed(() => {
    const cat = this.category();
    if (!cat) return null;
    const all = [...(cat.expenses ?? []), ...(cat.revenues ?? [])];
    if (!all.length) return null;
    const dates = all.map((t) => (t as { date?: string }).date).filter(Boolean) as string[];
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
  });

  /** Отформатированная дата последней транзакции (d MMM). */
  lastActivityDateFormatted = computed(() => {
    const d = this.lastActivityDate();
    return d ? formatDate(d, 'd MMM', 'en') : null;
  });

  /** Средняя сумма расхода по категории в выбранной валюте (для страницы деталей). */
  averageExpense = computed(() => {
    const cat = this.category();
    const count = cat?.expenses?.length ?? 0;
    if (!cat || count === 0) return null;
    const total = cat.totalExpenses ?? 0;
    const avgByn = total / count;
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(avgByn, 'BYN', primary);
  });

  hasChartData = computed(() => {
    const ch = this.chart();
    const data = ch?.datasets?.[0]?.data;
    if (!Array.isArray(data)) return false;
    return data.some((v) => typeof v === 'number' && v > 0);
  });

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

  displayedCells = signal<TableCell[]>([
    { field: 'date', name: 'txModal.date' },
    { field: 'title', name: 'common.title' },
    { field: 'type', name: 'txModal.type' },
    { field: 'amount', name: 'txModal.amount' },
  ]);

  /** Данные для списка (таблица/карточки): совместимы с TransactionListRow. */
  transactionListRows = computed<TransactionListRow[]>(() => {
    const cat = this.category();
    return this.transactions().map((t) => ({
      id: t.id,
      date: t.date,
      title: t.title,
      amount: t.amount,
      category: t.category ?? cat?.title,
      categoryIcon: cat?.icon ?? '',
      type: t.type,
    }));
  });

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 8,
        boxPadding: 4,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${this.formatChartTooltipValue(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      y: { display: false },
      x: { display: false },
    },
    elements: {
      line: { borderWidth: 1 },
      point: { radius: 1 },
    },
  };

  formatChartTooltipValue(v: number) {
    const primary = this.currencyService.primaryCode();
    const converted = this.exchangeRates.convert(v, 'BYN', primary);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: primary,
      maximumFractionDigits: 0,
    }).format(converted);
  }

  constructor() {
    super();
    effect(() => {
      if (this.allData().length > 0) this.sync();
    });
    effect(() => {
      const id = this.routeId();
      const categories = this.categoriesQuery.data();
      const charts = this.chartsQuery.data();
      if (id && categories && charts) {
        this.updateCategoryAndChart(id, categories, charts);
      }
    });
  }

  setUpdatedData(updatedData: TransactionDisplay[]): void {
    this.transactions.set(updatedData);
  }

  override ngOnInit(): void {
    // Categories and charts are loaded by injectQuery; effect above updates category/chart when ready
  }

  private updateCategoryAndChart(
    id: string,
    categories: CategoryItem[],
    charts: CategoryLineChartDto[],
  ) {
    const cat = categories.find((c) => String(c.id) === id) ?? null;
    this.category.set(cat);
    const ch = charts.find((c) => String(c.categoryId) === id) ?? null;
    this.chart.set(ch);
  }
}
