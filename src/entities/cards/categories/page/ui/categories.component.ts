import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  CategoriesHttpService,
  CategoryItem,
  CategoryLineChartDto,
  ExpensesHttpService,
  RoutePaths,
  TransactionsHttpService,
} from '@/shared';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditCategoryModalComponent } from '@/features/categories/edit-modal/modal/edit-card-modal.component';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'category-card',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [
    AppCurrencyPipe,
    BaseChartDirective,
    ContextMenuComponent,
    AppIconComponent,
    MatTooltipModule,
    TranslateModule,
  ],
  providers: [DialogService],
  standalone: true,
})
export class CategoryCardComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private expensesHttpService = inject(ExpensesHttpService);
  private queryClient = inject(QueryClient);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private i18n = inject(I18nService);
  category = input<CategoryItem>({ title: '', totalExpenses: 0 } as CategoryItem);
  chart = input<CategoryLineChartDto>();
  /** Групповая комната: кто сколько внёс по этой категории (уже в основной валюте). */
  groupPayerRows = input<Array<{ userId: string; name: string; amount: number }>>([]);
  /** В комнате категории фиксированы (Goals / Subscriptions) — без контекстного меню. */
  groupRoomContext = input(false);
  ref: DynamicDialogRef | undefined | null;
  readonly isTitleOverflowing = signal(false);

  compareDelta = computed(() => this.categoriesHttpService.getChartDeltaCompare(this.chart()));

  transactionCount = computed(() => {
    const cat = this.category();
    return (cat.expenses?.length ?? 0) + (cat.revenues?.length ?? 0);
  });

  /** Дата последней транзакции (расход или доход) в категории. */
  lastActivityDate = computed(() => {
    const cat = this.category();
    const all = [...(cat.expenses ?? []), ...(cat.revenues ?? [])];
    if (!all.length) return null;
    const dates = all.map((t) => (t as { date?: string }).date).filter(Boolean) as string[];
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
  });

  /** Средняя сумма расхода по категории в выбранной валюте (если есть расходы). */
  averageExpense = computed(() => {
    const cat = this.category();
    const count = cat.expenses?.length ?? 0;
    if (count === 0) return null;
    const total = cat.totalExpenses ?? 0;
    const avgByn = total / count;
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(avgByn, 'BYN', primary);
  });

  /** Есть ли у категории реальные данные для графика (хотя бы одно ненулевое значение). */
  hasChartData = computed(() => {
    const ch = this.chart();
    const data = ch?.datasets?.[0]?.data;
    if (!Array.isArray(data)) return false;
    return data.some((v) => typeof v === 'number' && Number.isFinite(v) && v !== 0);
  });

  /** Расходы в выбранной валюте */
  displayTotalExpenses = computed(() => {
    const cat = this.category();
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(cat.totalExpenses ?? 0, 'BYN', primary);
  });

  /** Доходы в выбранной валюте */
  displayTotalRevenues = computed(() => {
    const cat = this.category();
    const primary = this.currencyService.primaryCode();
    return this.exchangeRates.convert(cat.totalRevenues ?? 0, 'BYN', primary);
  });
  constructor(public dialogService: DialogService) {}

  checkTitleOverflow(el: ElementRef<HTMLElement> | HTMLElement) {
    const node = el instanceof ElementRef ? el.nativeElement : el;
    this.isTitleOverflowing.set(node.scrollWidth > node.clientWidth + 1);
  }

  readonly options: ChartConfiguration['options'] = {
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
          label: (ctx) => `${ctx.dataset.label}: ${this.formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: { display: false },
    },
    elements: {
      line: { borderWidth: 1 },
      point: { radius: 1 },
    },
  };

  formatCurrency(v: number) {
    const primary = this.currencyService.primaryCode();
    const converted = this.exchangeRates.convert(v, 'BYN', primary);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: primary,
      maximumFractionDigits: 0,
    }).format(converted);
  }

  handleDelete() {
    const cat = this.category();
    const txCount = (cat.expenses?.length ?? 0) + (cat.revenues?.length ?? 0);
    const warning =
      txCount > 0
        ? ` В этой категории ${txCount} транзакций — они будут удалены безвозвратно.`
        : '';
    this.confirmationService.confirm({
      message: `Удалить категорию «${cat.title}»?${warning}`,
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => this.doDeleteCategory(),
    });
  }

  private async doDeleteCategory() {
    try {
      await this.categoriesHttpService.deleteCategory(this.category().id);
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      this.queryClient.invalidateQueries({ queryKey: ['charts'] });
      this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
      this.categoriesHttpService.refreshCategories();
      this.transactionsHttpService.loadTransactions();
      this.expensesHttpService.refreshExpenses();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('common.success'),
        detail: this.i18n.t('categories.toast.deleted'),
        life: 3000,
      });
    } catch {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail: this.i18n.t('categories.toast.deleteError'),
        life: 3000,
      });
    }
  }

  handleEdit() {
    this.ref = this.dialogService.open(EditCategoryModalComponent, {
      header: this.i18n.t('categories.editCategory'),
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: this.category(),
    });
  }

  handleOpenDetails() {
    const id = this.category().id;
    if (id != null) {
      this.router.navigate([RoutePaths.CATEGORY_DETAILS, id]);
    }
  }
}
