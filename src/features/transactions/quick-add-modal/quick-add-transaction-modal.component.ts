import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  BalancesHttpService,
  CategoriesHttpService,
  CategoryItem,
  CreateTransactionPayload,
  StatisticsHttpService,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { Subject } from 'rxjs';
import { asyncScheduler } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
  throttleTime,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Минимальная форма: сумма, название, категория (с предсказанием).
 * Карта — основная по умолчанию; тип — расход; оплата картой; дата — сегодня.
 */
@Component({
  selector: 'quick-add-transaction-modal',
  templateUrl: './quick-add-transaction-modal.component.html',
  styleUrls: ['./quick-add-transaction-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    Select,
    PriceCurrencyFieldComponent,
    AppIconComponent,
    TranslatePipe,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAddTransactionModalComponent implements OnInit, AfterViewInit {
  private static readonly MIN_TITLE_LENGTH_FOR_PREDICT = 2;
  private static readonly PREDICT_DEBOUNCE_MS = 800;
  private static readonly PREDICT_THROTTLE_MS = 2500;

  private messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private ref = inject(DynamicDialogRef);
  private readonly categoriesHttpService = inject(CategoriesHttpService);
  private balancesHttpService = inject(BalancesHttpService);
  private statisticsHttpService = inject(StatisticsHttpService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected currencyService = inject(CurrencyService);
  protected i18n = inject(I18nService);

  private titleInput$ = new Subject<string>();

  protected categorizerLoading = false;
  protected isCategorySuggested = false;
  protected suggestedAlternatives: { id: string | number; title: string }[] = [];
  private currentPredictionKey = '';
  private currentPredictedCategoryId = '';
  private userChangedCategoryManually = false;
  private lastPredictedTitle = '';

  categories = injectQuery(() => ({
    queryKey: ['categories', 'scope', ''] as const,
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  cards = this.balancesHttpService.cards;

  constructor() {
    effect(() => {
      const list = this.cards();
      if (list.length === 0) return;
      const primary = list.find((c) => c.isPrimary) ?? list[0];
      if (!primary) return;
      const current = this.form.cardId;
      const needSet = current === '' || current === null || current === undefined;
      if (needSet) {
        this.form.cardId = primary.id;
      }
    });

    this.titleInput$
      .pipe(
        debounceTime(QuickAddTransactionModalComponent.PREDICT_DEBOUNCE_MS),
        throttleTime(QuickAddTransactionModalComponent.PREDICT_THROTTLE_MS, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        distinctUntilChanged(),
        filter(
          (text) =>
            (text ?? '').trim().length >=
            QuickAddTransactionModalComponent.MIN_TITLE_LENGTH_FOR_PREDICT,
        ),
        switchMap((text) => {
          this.categorizerLoading = true;
          this.isCategorySuggested = false;
          this.suggestedAlternatives = [];
          this.cdr.markForCheck();
          return this.statisticsHttpService.predict(text.trim()).pipe(
            catchError(() => {
              this.categorizerLoading = false;
              this.cdr.markForCheck();
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((prediction) => {
        this.categorizerLoading = false;
        if (!prediction?.primary) {
          this.resetPredictionState();
          this.cdr.markForCheck();
          return;
        }
        this.currentPredictionKey = prediction.predictionKey ?? '';
        const list = this.categories.data() ?? [];
        const primary = this.resolveCategoryFromPrediction(list, prediction.primary);
        if (!primary) {
          this.resetPredictionState();
          this.cdr.markForCheck();
          return;
        }
        if (!this.userChangedCategoryManually) {
          this.form.categoryId = primary.id;
          this.currentPredictedCategoryId = String(primary.id);
        } else {
          this.currentPredictedCategoryId = String(primary.id);
        }
        const allSuggested = [prediction.primary, ...(prediction.alternatives ?? [])];
        const seen = new Set<string>();
        this.suggestedAlternatives = [];
        for (const p of allSuggested) {
          const cat = this.resolveCategoryFromPrediction(list, p);
          const key = cat ? String(cat.id) : '';
          if (cat && key && !seen.has(key)) {
            seen.add(key);
            this.suggestedAlternatives.push({ id: cat.id, title: cat.title });
          }
        }
        this.isCategorySuggested = this.suggestedAlternatives.length > 0;
        this.cdr.markForCheck();
      });
  }

  private resolveCategoryFromPrediction(
    list: CategoryItem[],
    p: { category_id?: string; category_name?: string },
  ): CategoryItem | undefined {
    const id = String(p.category_id ?? '').trim();
    if (id) {
      const byId = list.find((c) => String(c.id) === id || c.id === Number(id));
      if (byId) return byId;
    }
    const rawName = (p.category_name ?? '').trim();
    const name = rawName.toLowerCase();
    if (!name || name === 'неизвестно' || name === 'unknown') return undefined;
    return list.find((c) => (c.title ?? '').trim().toLowerCase() === name);
  }

  protected onTitleChange(value: string): void {
    const normalized = (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (normalized !== this.lastPredictedTitle) {
      this.userChangedCategoryManually = false;
    }
    this.titleInput$.next(value ?? '');
    if (normalized.length < QuickAddTransactionModalComponent.MIN_TITLE_LENGTH_FOR_PREDICT) {
      this.resetPredictionState();
      this.cdr.markForCheck();
    } else {
      this.lastPredictedTitle = normalized;
    }
  }

  protected selectSuggestedCategory(id: string | number): void {
    this.form.categoryId = id;
    this.currentPredictedCategoryId = String(id);
    this.userChangedCategoryManually = true;
    this.cdr.markForCheck();
  }

  protected onCategoryChange(): void {
    this.userChangedCategoryManually = true;
  }

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateTransactionPayload) =>
      this.transactionsHttpService.createTransaction(payload),
    onSuccess: () => {
      this.balancesHttpService.refresh();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('common.success'),
        detail: this.i18n.t('txModal.toast.addSuccess'),
        life: 3000,
      });
      this.ref.close(true);
    },
    onError: (err: unknown) => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('common.error'),
        detail: this.extractApiErrorMessage(err) ?? this.i18n.t('txModal.toast.addError'),
        life: 3000,
      });
    },
  }));

  private extractApiErrorMessage(err: unknown): string | null {
    const httpErr = err as HttpErrorResponse | undefined;
    const payload = httpErr?.error;
    if (typeof payload === 'string' && payload.trim()) return payload.trim();
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message.trim();
      if (Array.isArray(message) && message.length) {
        const first = message.find((m) => typeof m === 'string' && m.trim()) as string | undefined;
        if (first) return first.trim();
      }
    }
    return null;
  }

  protected form: {
    title: string;
    categoryId: string | number;
    cardId: string | number;
    amount: number;
    currencyCode: string;
  } = {
    title: '',
    categoryId: '',
    cardId: '' as string | number,
    amount: 0,
    currencyCode: '',
  };

  private formatDateLocal(v: string | Date): string {
    if (v === null || v === '') return '';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  protected buildPayload(): CreateTransactionPayload {
    const f = this.form;
    const payload: CreateTransactionPayload = {
      cardId: String(f.cardId),
      type: 'expense',
      amount: Number(f.amount) || 0,
      currencyCode: f.currencyCode ?? this.currencyService.primaryCode(),
      date: this.formatDateLocal(new Date()),
      title: f.title?.trim() ? f.title.trim() : undefined,
      paymentMethod: 'card',
      affectsCardBalance: true,
      categoryId: String(f.categoryId),
    };
    if (this.currentPredictionKey && this.currentPredictedCategoryId) {
      payload.predictionKey = this.currentPredictionKey;
      payload.predictedCategoryId = this.currentPredictedCategoryId;
    }
    return payload;
  }

  private resetPredictionState(): void {
    this.isCategorySuggested = false;
    this.suggestedAlternatives = [];
    this.currentPredictionKey = '';
    this.currentPredictedCategoryId = '';
  }

  ngOnInit(): void {
    if (!this.form.currencyCode) {
      this.form.currencyCode = this.currencyService.primaryCode();
    }
    this.balancesHttpService.refresh();
    const cards = this.cards();
    const primaryCard = cards.find((c) => c.isPrimary) ?? cards[0];
    if (primaryCard && (this.form.cardId === '' || this.form.cardId == null)) {
      this.form.cardId = primaryCard.id;
    }
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      document.getElementById('quickAmount')?.focus();
    });
  }

  protected isSaveDisabled(form: NgForm | null | undefined): boolean {
    if (this.mutation.isPending()) return true;
    if (!form) return true;
    const amount = Number(this.form.amount) || 0;
    if (amount <= 0) return true;
    if (!this.form.cardId) return true;
    if (!this.form.categoryId) return true;
    return !!form.invalid;
  }

  onSubmit(form: NgForm): void {
    const amountOk = Number(this.form.amount) > 0;
    if (!amountOk || !this.form.cardId || !this.form.categoryId) return;
    if (form.valid) {
      this.mutation.mutate(this.buildPayload());
    }
  }

  close(): void {
    this.ref.close();
  }
}
