import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  DestroyRef,
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
  CreateTransactionPayload,
  StatisticsHttpService,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { Subject } from 'rxjs';
import { asyncScheduler } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
  throttleTime,
} from 'rxjs';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    DatePickerModule,
    Select,
    PriceCurrencyFieldComponent,
    AppIconComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionModalComponent implements OnInit {
  private static readonly MIN_TITLE_LENGTH_FOR_PREDICT = 2;
  /** Пауза после ввода перед запросом (мс). */
  private static readonly PREDICT_DEBOUNCE_MS = 800;
  /** Минимальный интервал между запросами (мс), чтобы не получать 429. */
  private static readonly PREDICT_THROTTLE_MS = 2500;
  private messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private ref = inject(DynamicDialogRef);
  private categoriesHttpService = inject(CategoriesHttpService);
  private balancesHttpService = inject(BalancesHttpService);
  private statisticsHttpService = inject(StatisticsHttpService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected currencyService = inject(CurrencyService);

  /** Стрим введённого названия для debounce + predict */
  private titleInput$ = new Subject<string>();

  /** Идёт ли запрос предсказания категории */
  protected categorizerLoading = false;
  /** Есть ли предугаданная категория (для подписи «предугадано» в заголовке) */
  protected isCategorySuggested = false;
  /** Альтернативные категории от ML для тегов (id + title из списка пользователя) */
  protected suggestedAlternatives: { id: string | number; title: string }[] = [];
  /** Cache key from last predict response (for feedback on submit). */
  private currentPredictionKey = '';
  /** Category id we suggested (primary or selected alternative). */
  private currentPredictedCategoryId = '';

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  cards = this.balancesHttpService.cards;

  constructor() {
    effect(() => {
      const list = this.cards();
      if (list.length === 0) return;
      const primary = list.find((c) => c.isPrimary) ?? list[0];
      if (primary) {
        const current = this.form.cardId;
        const needSet = current === '' || current === null || current === undefined;
        if (needSet) {
          this.form.cardId = primary.id;
        }
      }
    });

    this.titleInput$
      .pipe(
        debounceTime(AddTransactionModalComponent.PREDICT_DEBOUNCE_MS),
        throttleTime(AddTransactionModalComponent.PREDICT_THROTTLE_MS, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        distinctUntilChanged(),
        filter(
          (text) =>
            (text ?? '').trim().length >= AddTransactionModalComponent.MIN_TITLE_LENGTH_FOR_PREDICT,
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
          this.currentPredictionKey = '';
          this.currentPredictedCategoryId = '';
          this.cdr.markForCheck();
          return;
        }
        this.currentPredictionKey = prediction.predictionKey ?? '';
        this.currentPredictedCategoryId = prediction.primary.category_id ?? '';
        const list = this.categories.data() ?? [];
        const byId = (id: string) => list.find((c) => String(c.id) === id || c.id === Number(id));
        const primary = byId(prediction.primary.category_id);
        if (primary) {
          this.form.categoryId = primary.id;
        }
        const allSuggested = [prediction.primary, ...(prediction.alternatives ?? [])];
        const seen = new Set<string>();
        this.suggestedAlternatives = [];
        for (const p of allSuggested) {
          const cat = byId(p.category_id);
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

  protected onTitleChange(value: string): void {
    this.titleInput$.next(value ?? '');
    if (!(value ?? '').trim()) {
      this.isCategorySuggested = false;
      this.suggestedAlternatives = [];
      this.currentPredictionKey = '';
      this.currentPredictedCategoryId = '';
      this.cdr.markForCheck();
    }
  }

  protected selectSuggestedCategory(id: string | number): void {
    this.form.categoryId = id;
    this.currentPredictedCategoryId = String(id);
    this.cdr.markForCheck();
  }

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateTransactionPayload) =>
      this.transactionsHttpService.createTransaction(payload),
    onSuccess: () => {
      this.balancesHttpService.refresh();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction added',
        life: 3000,
      });
      this.ref.close(true);
    },
    onError: () => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add transaction',
        life: 3000,
      });
    },
  }));

  protected form: {
    date: string | Date;
    title: string;
    /** Category id (number from p-select, string in payload) */
    categoryId: string | number;
    /** Card id for Select (number) and API (string via buildPayload). */
    cardId: string | number;
    type: 'expense' | 'revenue';
    amount: number;
    currencyCode: string;
    description: string;
    paymentMethod?: 'cash' | 'card';
  } = {
    date: this.formatDateLocal(new Date()) as string,
    title: '',
    categoryId: '',
    cardId: '' as string | number,
    type: 'expense',
    amount: 0,
    currencyCode: '',
    description: '',
    paymentMethod: undefined,
  };

  protected readonly paymentMethodOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
  ];

  protected readonly typeOptions = [
    { label: 'Expense', value: 'expense' },
    { label: 'Revenue', value: 'revenue' },
  ];

  /** YYYY-MM-DD in local timezone (avoids Mar 1 → Feb 28 shift) */
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
      categoryId: String(f.categoryId),
      type: f.type,
      amount: Number(f.amount) || 0,
      currencyCode: f.currencyCode ?? this.currencyService.primaryCode(),
      date: this.formatDateLocal(f.date),
      title: f.title || undefined,
      description: f.description || undefined,
      paymentMethod: f.paymentMethod || undefined,
    };
    if (this.currentPredictionKey && this.currentPredictedCategoryId) {
      payload.predictionKey = this.currentPredictionKey;
      payload.predictedCategoryId = this.currentPredictedCategoryId;
    }
    return payload;
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

  onSubmit(form: NgForm) {
    if (form.valid && this.form.cardId && this.form.categoryId && this.form.amount > 0) {
      this.mutation.mutate(this.buildPayload());
    }
  }

  close(): void {
    this.ref.close();
  }
}
