import { ChangeDetectionStrategy, Component, effect, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import {
  CategoriesHttpService,
  CreateSubscribeItem,
  SubscribeItem,
  SubscribtionsHttpService,
  SUBSCRIPTIONS_CATEGORY_NAME,
} from '@/shared';

type SubscriptionFormState = Partial<SubscribeItem> & {
  currencyCode: string;
  categoryId?: string | null;
  [key: string]: unknown;
};
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { catchError, of, tap } from 'rxjs';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'edit-subscription-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    Select,
    DatePickerModule,
    PriceCurrencyFieldComponent,
    AppIconComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSubscriptionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private subscriptionsHttpService = inject(SubscribtionsHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
  private currencyService = inject(CurrencyService);
  private categoriesHttpService = inject(CategoriesHttpService);
  subscription = this.config.data as SubscribeItem;

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  updateSubscription(subscription: CreateSubscribeItem) {
    this.subscriptionsHttpService
      .update(this.subscription.id, subscription)
      .pipe(
        tap(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Subscription updated',
            life: 3000,
          });
          this.ref.close();
          this.queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        }),
        catchError(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update subscription',
            life: 4000,
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  /** Formats date to YYYY-MM-DD using local timezone (avoids UTC shift, e.g. Mar 1 → Feb 28) */
  private formatDate(v: string | Date | null | undefined): string | undefined {
    if (v == null || v === '') return undefined;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = (v as unknown) instanceof Date ? (v as Date) : new Date(v as string);
    if (isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  isFormValid(): boolean {
    const c = this.card();
    const sd = this.formatDate(c.subscribeDate);
    const lc = this.formatDate(c.lastCharge);
    const hasName = String(c.subscribeName ?? '').trim().length > 0;
    const hasType = String(c.type ?? '').trim().length > 0;
    const amount = Number(c.amount);
    const hasAmount = amount != null && !Number.isNaN(amount) && amount > 0;
    if (!hasName || !sd || !hasType || !lc || !hasAmount) return false;
    return lc >= sd;
  }

  onSubmit(form: NgForm) {
    this.hasAttemptedSubmit.set(true);
    this.touchedFields.update((s) => {
      const next = new Set(s);
      this.inputs.forEach((i) => next.add(i.field));
      return next;
    });
    form.form.markAllAsTouched();

    const c = this.card();
    const value = form.value;
    const subscribeDate = this.formatDate(value.subscribeDate ?? c.subscribeDate);
    const lastCharge = this.formatDate(value.lastCharge ?? c.lastCharge);

    if (!this.isFormValid()) return;

    const payload: CreateSubscribeItem = {
      ...c,
      ...value,
      subscribeDate: subscribeDate ?? '',
      lastCharge: lastCharge ?? '',
      amount: value.amount ?? c.amount ?? 0,
      currencyCode: value.currencyCode ?? c.currencyCode ?? this.currencyService.primaryCode(),
    };
    this.updateSubscription(payload);
  }

  inputs = [
    { name: 'subscribeDate', placeholder: 'Start date', field: 'subscribeDate', required: true },
    { name: 'subscribeName', placeholder: 'Title', field: 'subscribeName', required: true },
    { name: 'description', placeholder: 'Description', field: 'description' },
    { name: 'type', placeholder: 'Type', field: 'type', required: true },
    { name: 'categoryId', placeholder: 'Category', field: 'categoryId' },
    { name: 'lastCharge', placeholder: 'Last paid', field: 'lastCharge', required: true },
    { name: 'amount', placeholder: 'Amount', field: 'amount', required: true },
  ];

  typeOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'One-time', value: 'one-time' },
  ];

  card = signal<SubscriptionFormState>({} as SubscriptionFormState);
  touchedFields = signal<Set<string>>(new Set());
  hasAttemptedSubmit = signal(false);

  constructor() {
    effect(() => {
      const cats = this.categories.data();
      const c = this.card();
      if (cats?.length && (!c.categoryId || c.categoryId === '')) {
        const subsCat = cats.find(
          (cat) =>
            String(cat.title ?? '').toLowerCase() === SUBSCRIPTIONS_CATEGORY_NAME.toLowerCase(),
        );
        if (subsCat) {
          this.updateCardField('categoryId', String(subsCat.id));
        }
      }
    });
  }

  markTouched(field: string): void {
    this.touchedFields.update((s) => {
      const next = new Set(s);
      next.add(field);
      return next;
    });
  }

  shouldShowError(field: string): boolean {
    return this.touchedFields().has(field) || this.hasAttemptedSubmit();
  }

  /** Returns error message for a field, or null if valid. */
  getFieldError(field: string): string | null {
    const c = this.card();
    const sd = this.formatDate(c.subscribeDate);
    const lc = this.formatDate(c.lastCharge);
    switch (field) {
      case 'subscribeName':
        return !String(c.subscribeName ?? '').trim() ? 'Title is required' : null;
      case 'subscribeDate':
        return !sd ? 'Start date is required' : null;
      case 'type':
        return !String(c.type ?? '').trim() ? 'Type is required' : null;
      case 'lastCharge':
        if (!lc) return 'Last paid is required';
        if (sd && lc < sd) return 'Last paid cannot be earlier than start date';
        return null;
      case 'amount': {
        const a = Number(c.amount);
        if (a == null || Number.isNaN(a)) return 'Amount is required';
        if (a < 0) return 'Amount must be ≥ 0';
        if (a === 0) return 'Amount must be greater than 0';
        return null;
      }
      default:
        return null;
    }
  }

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      (acc as Record<string, unknown>)[cur.field] =
        this.subscription[cur.field as keyof SubscribeItem];
      return acc;
    }, {} as SubscriptionFormState);
    card.currencyCode = this.subscription.currencyCode ?? this.currencyService.primaryCode();
    card.categoryId = this.subscription.categoryId ?? card.categoryId;
    this.card.set(card);
  }

  onChangeDate(date: { firstInputDate?: Date }) {
    if (date?.firstInputDate) {
      this.card.update((c) => ({ ...c, date: date.firstInputDate }));
    }
  }

  updateCardField(field: string, value: unknown) {
    this.card.update((state) => ({ ...state, [field]: value }) as SubscriptionFormState);
  }

  close(): void {
    this.ref.close();
  }
}
