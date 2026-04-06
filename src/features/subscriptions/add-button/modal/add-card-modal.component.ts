import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CategoriesHttpService,
  CreateSubscribeItem,
  SubscribtionsHttpService,
  SUBSCRIPTIONS_CATEGORY_NAME,
} from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { catchError, of, tap } from 'rxjs';

type SubscriptionFormField =
  | 'subscribeDate'
  | 'subscribeName'
  | 'description'
  | 'type'
  | 'categoryId'
  | 'lastCharge'
  | 'amount';

interface SubscriptionFormData {
  subscribeDate: string | Date;
  subscribeName: string;
  description: string;
  type: string;
  lastCharge: string | Date;
  amount: number;
  currencyCode: string;
  categoryId?: string | null;
}

@Component({
  selector: 'edit-subscription-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
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
export class AddSubscriptionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private subscriptionsHttpService = inject(SubscribtionsHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
  private currencyService = inject(CurrencyService);
  private categoriesHttpService = inject(CategoriesHttpService);

  protected getGroupRoomId(): string | undefined {
    const d = this.config.data as { groupRoomId?: unknown } | null | undefined;
    if (!d || typeof d !== 'object' || !('groupRoomId' in d)) return undefined;
    const v = (d as { groupRoomId: unknown }).groupRoomId;
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  }

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

  cardData: SubscriptionFormData = {
    subscribeDate: '',
    subscribeName: '',
    description: '',
    type: '',
    lastCharge: '',
    amount: 0,
    currencyCode: '',
    categoryId: undefined,
  };

  inputs: Array<{
    name: string;
    placeholder: string;
    field: SubscriptionFormField;
    required?: boolean;
  }> = [
    { name: 'subscribeName', placeholder: 'Title', field: 'subscribeName', required: true },
    {
      name: 'subscribeDate',
      placeholder: 'Start date',
      field: 'subscribeDate',
      required: true,
    },
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

  isTouchUI = signal(false);
  /** Fields that user has focused and left (blurred). Errors show only for touched fields. */
  touchedFields = signal<Set<string>>(new Set());
  /** Set when user clicks Add — then all errors show. */
  hasAttemptedSubmit = signal(false);

  markTouched(field: SubscriptionFormField): void {
    this.touchedFields.update((s) => {
      const next = new Set(s);
      next.add(field);
      return next;
    });
  }

  /** Whether to show error for this field (touched or submit attempted). */
  shouldShowError(field: SubscriptionFormField): boolean {
    return this.touchedFields().has(field) || this.hasAttemptedSubmit();
  }

  constructor() {
    effect(() => {
      const cats = this.categories.data();
      if (cats?.length && !this.cardData.categoryId) {
        const subsCat = this.findSubscriptionsCategory(cats);
        if (subsCat) {
          this.cardData = { ...this.cardData, categoryId: String(subsCat.id) };
        }
      }
    });
  }

  private findSubscriptionsCategory(cats: { id: string | number; title?: string }[]) {
    return cats.find(
      (c) => String(c.title ?? '').toLowerCase() === SUBSCRIPTIONS_CATEGORY_NAME.toLowerCase(),
    );
  }

  ngOnInit() {
    const today = this.getTodayString();
    const cats = this.categories.data();
    const subsCat = cats?.length ? this.findSubscriptionsCategory(cats) : null;
    this.cardData = {
      subscribeDate: today,
      subscribeName: '',
      description: '',
      type: '',
      lastCharge: today,
      amount: 0,
      currencyCode: this.currencyService.primaryCode(),
      categoryId: subsCat ? String(subsCat.id) : undefined,
    };
    this.isTouchUI.set(typeof window !== 'undefined' && window.innerWidth < 780);
  }

  /** Returns error message for a field, or null if valid. Only shown when shouldShowError(field). */
  getFieldError(field: SubscriptionFormField): string | null {
    switch (field) {
      case 'subscribeName': {
        const v = String(this.cardData.subscribeName ?? '').trim();
        return !v ? 'Title is required' : null;
      }
      case 'subscribeDate':
        return !this.formatDate(this.cardData.subscribeDate) ? 'Start date is required' : null;
      case 'type':
        return !String(this.cardData.type ?? '').trim() ? 'Type is required' : null;
      case 'lastCharge': {
        const lc = this.formatDate(this.cardData.lastCharge);
        const sd = this.formatDate(this.cardData.subscribeDate);
        if (!lc) return 'Last paid is required';
        if (sd && lc < sd) return 'Last paid cannot be earlier than start date';
        return null;
      }
      case 'amount': {
        const a = Number(this.cardData.amount);
        if (a == null || Number.isNaN(a)) return 'Amount is required';
        if (a < 0) return 'Amount must be ≥ 0';
        if (a === 0) return 'Amount must be greater than 0';
        return null;
      }
      default:
        return null;
    }
  }

  isFormValid(): boolean {
    const sd = this.formatDate(this.cardData.subscribeDate);
    const lc = this.formatDate(this.cardData.lastCharge);
    const hasName = String(this.cardData.subscribeName ?? '').trim().length > 0;
    const hasType = String(this.cardData.type ?? '').trim().length > 0;
    const amount = Number(this.cardData.amount);
    const hasAmount = amount != null && !Number.isNaN(amount) && amount > 0;
    if (!hasName || !sd || !hasType || !lc || !hasAmount) return false;
    return lc >= sd;
  }

  createSubscription(payload: CreateSubscribeItem) {
    const roomId = this.getGroupRoomId();
    this.subscriptionsHttpService
      .create(payload, roomId ? { groupRoomId: roomId } : undefined)
      .pipe(
        tap(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Subscription created',
            life: 3000,
          });
          this.ref.close(true);
          this.queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
          if (roomId) {
            void this.queryClient.invalidateQueries({
              queryKey: ['subscriptions', 'room', roomId],
            });
          }
        }),
        catchError(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create subscription',
            life: 4000,
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  /** Returns today's date as YYYY-MM-DD (local timezone). */
  private getTodayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** Formats date to YYYY-MM-DD using local timezone (avoids UTC shift, e.g. Mar 1 → Feb 28) */
  private formatDate(v: string | Date | undefined): string | undefined {
    if (v == null || v === '') return undefined;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = (v as unknown) instanceof Date ? (v as Date) : new Date(v as string);
    if (isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onSubmit(form: NgForm) {
    this.hasAttemptedSubmit.set(true);
    this.touchedFields.update((s) => {
      const next = new Set(s);
      this.inputs.forEach((i) => next.add(i.field));
      return next;
    });
    form.form.markAllAsTouched();

    const subscribeDate = this.formatDate(this.cardData.subscribeDate);
    const lastCharge = this.formatDate(this.cardData.lastCharge);
    const subscribeName = String(this.cardData.subscribeName ?? '').trim();
    const type = String(this.cardData.type ?? '').trim();
    const amount = Number(this.cardData.amount);

    if (!this.isFormValid()) return;

    const payload: CreateSubscribeItem = {
      subscribeName,
      subscribeDate: subscribeDate!,
      amount,
      currencyCode: this.cardData.currencyCode || undefined,
      description: this.cardData.description ? String(this.cardData.description).trim() : undefined,
      type: String(this.cardData.type ?? ''),
      lastCharge: lastCharge!,
      categoryId: this.cardData.categoryId || undefined,
    };
    this.createSubscription(payload);
  }

  close() {
    this.ref.close();
  }
}
