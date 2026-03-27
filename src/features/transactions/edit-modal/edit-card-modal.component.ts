import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  signal,
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
  CreateTransaction,
  StatisticsHttpService,
  StatisticsRefreshService,
  Transaction,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectQuery } from '@tanstack/angular-query-experimental';
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
  tap,
  throttleTime,
} from 'rxjs';

@Component({
  selector: 'edit-transaction-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    Select,
    PriceCurrencyFieldComponent,
    AppIconComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTransactionModalComponent implements OnInit {
  private static readonly MIN_TITLE_LENGTH_FOR_PREDICT = 2;
  private static readonly PREDICT_DEBOUNCE_MS = 800;
  private static readonly PREDICT_THROTTLE_MS = 2500;
  messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private config = inject(DynamicDialogConfig);
  private categoriesHttpService = inject(CategoriesHttpService);
  private statisticsHttpService = inject(StatisticsHttpService);
  private statisticsRefreshService = inject(StatisticsRefreshService);
  private balancesHttpService = inject(BalancesHttpService);
  private ref = inject(DynamicDialogRef);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected currencyService = inject(CurrencyService);
  transaction = this.config.data as Transaction;

  private titleInput$ = new Subject<string>();
  categorizerLoading = false;
  isCategorySuggested = false;
  suggestedAlternatives: { id: number; title: string }[] = [];
  private currentPredictionKey = '';
  private currentPredictedCategoryId = '';

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  updateTransaction(transaction: CreateTransaction) {
    this.transactionsHttpService
      .updateTransaction(this.transaction.id, transaction)
      .pipe(
        tap(() => {
          this.balancesHttpService.refresh();
          this.transactionsHttpService.loadTransactions();
          this.statisticsRefreshService.refresh();
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Transaction updated',
            life: 3000,
          });
          this.ref.close();
        }),
        catchError(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update transaction',
            life: 4000,
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  /** YYYY-MM-DD in local timezone (avoids Mar 1 → Feb 28 shift) */
  private formatDateLocal(v: string | Date | undefined): string {
    if (v == null || v === '') return '';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const value = { ...form.value, date: this.formatDateLocal(form.value?.date) } as Record<
        string,
        unknown
      >;
      const categoryTitle = value['category'];
      const list = this.categories.data() ?? [];
      const cat = list.find((c) => c.title === categoryTitle);
      if (cat) value['categoryId'] = String(cat.id);
      if (this.currentPredictionKey && this.currentPredictedCategoryId) {
        value['predictionKey'] = this.currentPredictionKey;
        value['predictedCategoryId'] = this.currentPredictedCategoryId;
      }
      this.updateTransaction(
        value as CreateTransaction & {
          categoryId?: string;
          predictionKey?: string;
          predictedCategoryId?: string;
        },
      );
    }
  }

  inputs = [
    { name: 'date', placeholder: 'Date', field: 'date' },
    { name: 'title', placeholder: 'Title', field: 'title' },
    { name: 'category', placeholder: 'Category', field: 'category' },
    { name: 'type', placeholder: 'Type', field: 'type' },
    { name: 'currencyCode', placeholder: 'Currency', field: 'currencyCode' },
    { name: 'paymentMethod', placeholder: 'Payment method (optional)', field: 'paymentMethod' },
    { name: 'amount', placeholder: 'Amount', field: 'amount' },
  ];

  readonly paymentMethodOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
  ];

  card = signal<any>([]);

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      acc[cur.field] =
        this.transaction[cur.field as keyof CreateTransaction] ??
        (cur.field === 'currencyCode' ? this.currencyService.primaryCode() : undefined);
      return acc;
    }, {} as any);
    this.card.set(card);

    this.titleInput$
      .pipe(
        debounceTime(EditTransactionModalComponent.PREDICT_DEBOUNCE_MS),
        throttleTime(EditTransactionModalComponent.PREDICT_THROTTLE_MS, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        distinctUntilChanged(),
        filter(
          (text) =>
            (text ?? '').trim().length >=
            EditTransactionModalComponent.MIN_TITLE_LENGTH_FOR_PREDICT,
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
          this.updateCardField(primary.title);
        }
        const allSuggested = [prediction.primary, ...(prediction.alternatives ?? [])];
        const seen = new Set<number>();
        this.suggestedAlternatives = [];
        for (const p of allSuggested) {
          const cat = byId(p.category_id);
          if (cat && !seen.has(cat.id)) {
            seen.add(cat.id);
            this.suggestedAlternatives.push({ id: cat.id, title: cat.title });
          }
        }
        this.isCategorySuggested = this.suggestedAlternatives.length > 0;
        this.cdr.markForCheck();
      });
  }

  onTitleChange(value: string): void {
    this.titleInput$.next(value ?? '');
    if (!(value ?? '').trim()) {
      this.isCategorySuggested = false;
      this.suggestedAlternatives = [];
      this.currentPredictionKey = '';
      this.currentPredictedCategoryId = '';
      this.cdr.markForCheck();
    }
  }

  get categoryFieldLabel(): string {
    return this.isCategorySuggested ? 'Category (предугадано)' : 'Category';
  }

  selectSuggestedCategoryTitle(title: string, id?: number): void {
    this.updateCardField(title);
    if (id != null) this.currentPredictedCategoryId = String(id);
    this.cdr.markForCheck();
  }

  setCardFieldAndNotifyTitle(field: string, value: unknown): void {
    this.setCardField(field, value);
    if (field === 'title') {
      this.onTitleChange(value as string);
    }
  }

  onChangeDate(date: any) {
    if (date.firstInputDate) {
      this.card().date = date.firstInputDate;
    }
  }

  updateCardField(value: any) {
    this.card.update((state: any) => ({
      ...state,
      category: value,
    }));
  }

  setCardField(field: string, value: any) {
    this.card.update((state: any) => ({ ...state, [field]: value }));
  }

  get amount(): number {
    const a = this.card().amount;
    return a != null ? Number(a) : 0;
  }
  set amount(v: number) {
    this.setCardField('amount', v);
  }

  get currencyCode(): string {
    return (this.card().currencyCode as string) ?? this.currencyService.primaryCode();
  }
  set currencyCode(v: string) {
    this.setCardField('currencyCode', v);
  }

  close(): void {
    this.ref.close();
  }
}
