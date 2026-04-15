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
  GroupRoomsHttpService,
  StatisticsHttpService,
  StatisticsRefreshService,
  Transaction,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
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
  private readonly dialogCtx = (() => {
    const config = inject(DynamicDialogConfig);
    const d = config.data as { transaction?: Transaction; groupRoomId?: string } | Transaction;
    const raw = d as { transaction?: Transaction; groupRoomId?: string };
    const transaction = (raw?.transaction ?? d) as Transaction;
    const groupRoomId =
      typeof raw?.groupRoomId === 'string' && raw.groupRoomId.trim()
        ? raw.groupRoomId.trim()
        : undefined;
    return { transaction, groupRoomId };
  })();
  private categoriesHttpService = inject(CategoriesHttpService);
  private statisticsHttpService = inject(StatisticsHttpService);
  private statisticsRefreshService = inject(StatisticsRefreshService);
  private balancesHttpService = inject(BalancesHttpService);
  readonly cards = this.balancesHttpService.cards;
  private groupRoomsHttp = inject(GroupRoomsHttpService);
  private queryClient = inject(QueryClient);
  private ref = inject(DynamicDialogRef);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected currencyService = inject(CurrencyService);
  readonly transaction = this.dialogCtx.transaction;

  protected getGroupRoomId(): string | undefined {
    return this.dialogCtx.groupRoomId;
  }

  /** В комнате API PATCH не меняет тип/способ оплаты/флаг карты — поля скрываем. */
  protected get editFormInputs() {
    const isTransfer = String(this.card().type ?? '') === 'transfer';
    let base = this.inputs;
    if (this.dialogCtx.groupRoomId) {
      base = base.filter((i) => !['type', 'paymentMethod'].includes(i.field));
    }
    if (isTransfer) {
      base = base.filter((i) => i.field !== 'category');
    }
    return base;
  }

  private titleInput$ = new Subject<string>();
  categorizerLoading = false;
  isCategorySuggested = false;
  suggestedAlternatives: { id: string | number; title: string }[] = [];
  private currentPredictionKey = '';
  private currentPredictedCategoryId = '';
  private userChangedCategoryManually = false;
  private lastPredictedTitle = '';

  categories = injectQuery(() => {
    const roomId = this.getGroupRoomId() ?? '';
    return {
      queryKey: ['categories', 'scope', roomId] as const,
      queryFn: () =>
        roomId
          ? this.categoriesHttpService.fetchCategoriesByRoom(roomId)
          : this.categoriesHttpService.getCategories(),
    };
  });

  updateTransaction(
    payload: CreateTransaction & {
      categoryId?: string;
      predictionKey?: string;
      predictedCategoryId?: string;
    },
  ) {
    const rid = this.getGroupRoomId();
    const gtxId = this.transaction.groupTransactionId;
    if (rid && gtxId) {
      this.groupRoomsHttp
        .updateRoomTransaction(rid, gtxId, {
          amount: Number(payload.amount),
          currencyCode: payload.currencyCode || this.currencyService.primaryCode(),
          title: String(payload.title ?? '').trim(),
          date: this.formatDateLocal(payload.date as string),
          ...(payload.description != null && String(payload.description).trim() !== ''
            ? { description: String(payload.description).trim() }
            : {}),
          ...(payload.categoryId ? { categoryId: String(payload.categoryId) } : {}),
        })
        .pipe(
          tap(() => {
            this.balancesHttpService.refresh();
            void this.queryClient.invalidateQueries({ queryKey: ['groupTransactions', rid] });
            void this.queryClient.invalidateQueries({ queryKey: ['charts', 'room', rid] });
            void this.queryClient.invalidateQueries({ queryKey: ['roomContributions', rid] });
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
      return;
    }

    this.transactionsHttpService
      .updateTransaction(this.transaction.id, payload)
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
      if (String(value['type'] ?? '') !== 'transfer') {
        const categoryTitle = value['category'];
        const list = this.categories.data() ?? [];
        const cat = list.find((c) => c.title === categoryTitle);
        if (cat) value['categoryId'] = String(cat.id);
      } else if (this.card().transferToCardId != null) {
        value['transferToCardId'] = String(this.card().transferToCardId);
      }
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

  readonly typeOptions = [
    { label: 'Expense', value: 'expense' },
    { label: 'Revenue', value: 'revenue' },
    { label: 'Transfer', value: 'transfer' },
  ];

  card = signal<any>([]);

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      let v =
        this.transaction[cur.field as keyof CreateTransaction] ??
        (cur.field === 'currencyCode' ? this.currencyService.primaryCode() : undefined);
      if (cur.field === 'type') {
        if (v == null || v === '') {
          v = 'expense';
        } else {
          const t = String(v).toLowerCase();
          v = t === 'revenue' ? 'revenue' : t === 'transfer' ? 'transfer' : 'expense';
        }
      }
      acc[cur.field] = v;
      return acc;
    }, {} as any);
    card['affectsCardBalance'] = this.transaction.affectsCardBalance !== false;
    if (this.transaction.transferToCardId != null && this.transaction.transferToCardId !== '') {
      card['transferToCardId'] = Number(this.transaction.transferToCardId);
    }
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
          return this.statisticsHttpService
            .predict(text.trim(), { roomId: this.getGroupRoomId() })
            .pipe(
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
        const primaryId = String(prediction.primary.category_id ?? '').trim();
        if (!primaryId) {
          this.resetPredictionState();
          this.cdr.markForCheck();
          return;
        }
        this.currentPredictionKey = prediction.predictionKey ?? '';
        const list = this.categories.data() ?? [];
        const byId = (id: string) => list.find((c) => String(c.id) === id || c.id === Number(id));
        const primary = byId(primaryId);
        if (primary && !this.userChangedCategoryManually) {
          this.updateCardField(primary.title);
          this.currentPredictedCategoryId = String(primary.id);
        } else if (primary) {
          this.currentPredictedCategoryId = String(primary.id);
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

  onTitleChange(value: string): void {
    const normalized = (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (normalized !== this.lastPredictedTitle) {
      this.userChangedCategoryManually = false;
    }
    this.titleInput$.next(value ?? '');
    if (normalized.length < EditTransactionModalComponent.MIN_TITLE_LENGTH_FOR_PREDICT) {
      this.resetPredictionState();
      this.cdr.markForCheck();
    } else {
      this.lastPredictedTitle = normalized;
    }
  }

  get categoryFieldLabel(): string {
    return this.isCategorySuggested ? 'Category (предугадано)' : 'Category';
  }

  selectSuggestedCategoryTitle(title: string, id?: string | number): void {
    this.updateCardField(title);
    if (id != null) this.currentPredictedCategoryId = String(id);
    this.userChangedCategoryManually = true;
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

  dateValue(): string {
    return this.formatDateLocal(this.card().date);
  }

  setDateField(value: string): void {
    this.setCardField('date', this.formatDateLocal(value));
  }

  updateCardField(value: any) {
    this.card.update((state: any) => ({
      ...state,
      category: value,
    }));
  }

  setCardField(field: string, value: any) {
    if (field === 'category') {
      this.userChangedCategoryManually = true;
    }
    this.card.update((state: any) => ({ ...state, [field]: value }));
  }

  private resetPredictionState(): void {
    this.isCategorySuggested = false;
    this.suggestedAlternatives = [];
    this.currentPredictionKey = '';
    this.currentPredictedCategoryId = '';
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
