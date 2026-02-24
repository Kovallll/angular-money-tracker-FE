import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CreateSubscribeItem, SubscribtionsHttpService, Transaction } from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { catchError, of, tap } from 'rxjs';

type SubscriptionFormField =
  | 'subscribeDate'
  | 'subscribeName'
  | 'description'
  | 'type'
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
}

@Component({
  selector: 'edit-subscription-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    Select,
    DatePickerModule,
    PriceCurrencyFieldComponent,
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
  subscription = this.config.data as Transaction;

  cardData: SubscriptionFormData = {
    subscribeDate: '',
    subscribeName: '',
    description: '',
    type: '',
    lastCharge: '',
    amount: 0,
    currencyCode: '',
  };

  inputs: Array<{
    name: string;
    placeholder: string;
    field: SubscriptionFormField;
    required?: boolean;
  }> = [
    {
      name: 'subscribeDate',
      placeholder: 'Date (YYYY-MM-DD)',
      field: 'subscribeDate',
      required: true,
    },
    { name: 'subscribeName', placeholder: 'Title', field: 'subscribeName', required: true },
    { name: 'description', placeholder: 'Description', field: 'description' },
    { name: 'type', placeholder: 'Type', field: 'type' },
    { name: 'lastCharge', placeholder: 'Last charge (YYYY-MM-DD)', field: 'lastCharge' },
    { name: 'amount', placeholder: 'Amount', field: 'amount', required: true },
  ];

  typeOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Annually', value: 'annually' },
    { label: 'Daily', value: 'daily' },
  ];

  ngOnInit() {
    this.cardData = {
      subscribeDate: '',
      subscribeName: '',
      description: '',
      type: '',
      lastCharge: '',
      amount: 0,
      currencyCode: this.currencyService.primaryCode(),
    };
  }

  isAmountInvalid(): boolean {
    const a = this.cardData.amount;
    return a == null || a === undefined || Number(a) < 0;
  }

  createSubscription(payload: CreateSubscribeItem) {
    this.subscriptionsHttpService
      .create(payload)
      .pipe(
        tap(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Subscription created',
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
            detail: 'Failed to create subscription',
            life: 4000,
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  private formatDate(v: string | Date | undefined): string | undefined {
    if (v == null || v === '') return undefined;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = (v as unknown) instanceof Date ? (v as Date) : new Date(v as string);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
  }

  onSubmit(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.invalid) return;

    const subscribeDate = this.formatDate(this.cardData.subscribeDate);
    const subscribeName = String(this.cardData.subscribeName ?? '').trim();
    const amount = Number(this.cardData.amount);
    if (!subscribeDate || !subscribeName) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'Title and Date are required.',
        life: 3000,
      });
      return;
    }
    if (amount < 0) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'Amount must be ≥ 0.',
        life: 3000,
      });
      return;
    }

    const payload: CreateSubscribeItem = {
      subscribeName,
      subscribeDate,
      amount,
      currencyCode: this.cardData.currencyCode || undefined,
      description: this.cardData.description ? String(this.cardData.description).trim() : undefined,
      type: this.cardData.type ? String(this.cardData.type) : '',
      lastCharge: this.formatDate(this.cardData.lastCharge) ?? '',
    };
    this.createSubscription(payload);
  }

  close() {
    this.ref.close();
  }
}
