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
  type UpdateGroupTxPayload,
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
import { I18nService } from '@/shared/services';
import { TranslatePipe } from '@ngx-translate/core';
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
    TranslatePipe,
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
  protected i18n = inject(I18nService);
  readonly transaction = this.dialogCtx.transaction;

  protected getGroupRoomId(): string | undefined {
    return this.dialogCtx.groupRoomId;
  }

  protected get editFormInputs() {
    const isTransfer = String(this.card().type ?? '') === 'transfer';
    let base = this.inputs;
    if (isTransfer) {
      base = base.filter((i) => i.field !== 'category' && i.field !== 'paymentMethod');
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
      const c = this.card();
      const txType =
        String(c.type ?? 'expense').toLowerCase() === 'revenue'
          ? 'revenue'
          : String(c.type ?? '').toLowerCase() === 'transfer'
            ? 'transfer'
            : 'expense';
      const paymentRaw = String(c.paymentMethod ?? 'card').toLowerCase();
      const paymentMethod: 'cash' | 'card' =
        txType === 'transfer' ? 'card' : paymentRaw === 'cash' ? 'cash' : 'card';
      const useCard = txType === 'transfer' || paymentMethod === 'card';
      const fromId = Number(c.cardId);
      const toId = Number(c.transferToCardId);
      const patch: UpdateGroupTxPayload = {
        amount: Number(payload.amount),
        currencyCode: payload.currencyCode || this.currencyService.primaryCode(),
        title: String(payload.title ?? '').trim(),
        date: this.formatDateLocal(payload.date as string),
        type: txType,
        affectsCardBalance: c.affectsCardBalance !== false,
        paymentMethod,
        ...(payload.description != null && String(payload.description).trim() !== ''
          ? { description: String(payload.description).trim() }
          : {}),
        ...(payload.categoryId ? { categoryId: String(payload.categoryId) } : {}),
      };
      if (txType === 'transfer') {
        if (Number.isFinite(fromId) && fromId > 0) patch.cardId = Math.trunc(fromId);
        if (Number.isFinite(toId) && toId > 0) patch.transferToCardId = Math.trunc(toId);
      } else if (useCard && Number.isFinite(fromId) && fromId > 0) {
        patch.cardId = Math.trunc(fromId);
      } else {
        patch.cardId = null;
      }
      this.groupRoomsHttp
        .updateRoomTransaction(rid, gtxId, patch)
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
              summary: this.i18n.t('common.success'),
              detail: this.i18n.t('txModal.toast.updateSuccess'),
              life: 3000,
            });
            this.ref.close();
          }),
          catchError(() => {
            this.messageService.add({
              key: 'toast',
              severity: 'error',
              summary: this.i18n.t('common.error'),
              detail: this.i18n.t('txModal.toast.updateError'),
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
            summary: this.i18n.t('common.success'),
            detail: this.i18n.t('txModal.toast.updateSuccess'),
            life: 3000,
          });
          this.ref.close();
        }),
        catchError(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: this.i18n.t('common.error'),
            detail: this.i18n.t('txModal.toast.updateError'),
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
      const c = this.card();
      const value = { ...form.value, date: this.formatDateLocal(form.value?.date) } as Record<
        string,
        unknown
      >;
      value['type'] = c.type;
      value['paymentMethod'] = c.paymentMethod;
      value['affectsCardBalance'] = c.affectsCardBalance !== false;
      value['title'] = c.title ?? value['title'];
      value['amount'] = c.amount ?? value['amount'];
      value['currencyCode'] = c.currencyCode ?? value['currencyCode'];
      value['description'] =
        c.description != null && String(c.description).trim() !== ''
          ? String(c.description).trim()
          : '';
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
    { name: 'date', placeholder: 'txModal.date', field: 'date' },
    { name: 'title', placeholder: 'txModal.title', field: 'title' },
    { name: 'description', placeholder: 'txModal.description', field: 'description' },
    { name: 'category', placeholder: 'txModal.category', field: 'category' },
    { name: 'type', placeholder: 'txModal.type', field: 'type' },
    { name: 'currencyCode', placeholder: 'common.currency', field: 'currencyCode' },
    { name: 'paymentMethod', placeholder: 'txModal.paymentMethod', field: 'paymentMethod' },
    { name: 'amount', placeholder: 'txModal.amount', field: 'amount' },
  ];

  get paymentMethodOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('txModal.paymentMethods.cash'), value: 'cash' },
      { label: this.i18n.t('txModal.paymentMethods.card'), value: 'card' },
    ];
  }

  get typeOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('txModal.types.expense'), value: 'expense' },
      { label: this.i18n.t('txModal.types.revenue'), value: 'revenue' },
      { label: this.i18n.t('txModal.types.transfer'), value: 'transfer' },
    ];
  }

  card = signal<any>([]);

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      const raw = this.transaction as unknown as Record<string, unknown>;
      let v = raw[cur.field];
      if (v === undefined && cur.field === 'currencyCode') {
        v = this.currencyService.primaryCode();
      }
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
    if (this.transaction.groupTransactionId) {
      const cid = Number(this.transaction.cardId);
      card['cardId'] = Number.isFinite(cid) && cid > 0 ? cid : '';
      const pm = String(
        card['paymentMethod'] ?? this.transaction.paymentMethod ?? 'card',
      ).toLowerCase();
      card['paymentMethod'] = pm === 'cash' ? 'cash' : 'card';
    }
    this.card.set(card);
    this.balancesHttpService.refresh();

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
    const base = this.isCategorySuggested
      ? `${this.i18n.t('txModal.category')} (${this.i18n.t('txModal.predicted')})`
      : this.i18n.t('txModal.category');
    return this.getGroupRoomId() ? `${base} (${this.i18n.t('common.optional')})` : base;
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
    this.card.update((state: any) => {
      const next: Record<string, unknown> = { ...state, [field]: value };
      if (field === 'type' && value === 'transfer') {
        next['paymentMethod'] = 'card';
      }
      if (field === 'paymentMethod' && value === 'cash' && String(state.type) !== 'transfer') {
        next['cardId'] = '';
      }
      if (
        field === 'type' &&
        value !== 'transfer' &&
        String(next['paymentMethod'] || 'card') === 'card' &&
        (next['cardId'] === '' || next['cardId'] == null)
      ) {
        const list = this.cards();
        const primary = list.find((c) => c.isPrimary) ?? list[0];
        if (primary) next['cardId'] = primary.id;
      }
      return next;
    });
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

  protected isSaveDisabled(form: NgForm | null | undefined): boolean {
    if (!form) return true;
    const c = this.card();
    const amt = Number(c.amount) || 0;
    if (amt <= 0) return true;
    if (this.getGroupRoomId()) {
      if (c.type === 'transfer') {
        const from = Number(c.cardId);
        const to = Number(c.transferToCardId);
        if (!Number.isFinite(from) || from < 1) return true;
        if (!Number.isFinite(to) || to < 1 || to === from) return true;
      } else if ((c.paymentMethod || 'card') === 'card') {
        const from = Number(c.cardId);
        if (!Number.isFinite(from) || from < 1) return true;
      }
    }
    return !!form.invalid;
  }

  close(): void {
    this.ref.close();
  }
}
