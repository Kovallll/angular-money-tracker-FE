import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import {
  CreateSubscribeItem,
  CreateTransaction,
  SubscribtionsHttpService,
  Transaction,
} from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { catchError, of, tap } from 'rxjs';
@Component({
  selector: 'edit-subscription-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppButtonComponent,
    MessageModule,
    Select,
    DatePickerModule,
    PriceCurrencyFieldComponent,
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
  subscription = this.config.data as Transaction;

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

  private formatDate(v: string | Date | undefined): string | undefined {
    if (v == null || v === '') return undefined;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = (v as unknown) instanceof Date ? (v as Date) : new Date(v as string);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const value = form.value;
      const payload: CreateSubscribeItem = {
        ...value,
        subscribeDate: this.formatDate(value.subscribeDate) ?? '',
        lastCharge: this.formatDate(value.lastCharge) ?? '',
      };
      this.updateSubscription(payload);
    }
  }

  inputs = [
    { name: 'subscribeDate', placeholder: 'Date', field: 'subscribeDate' },
    { name: 'subscribeName', placeholder: 'Title', field: 'subscribeName' },
    { name: 'description', placeholder: 'Description', field: 'description' },
    { name: 'type', placeholder: 'Type', field: 'type' },
    { name: 'lastCharge', placeholder: 'Last charge', field: 'lastCharge' },
    { name: 'amount', placeholder: 'Amount', field: 'amount' },
  ];

  card = signal<any>([]);

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      acc[cur.field] = this.subscription[cur.field as keyof CreateTransaction];
      return acc;
    }, {} as any);
    (card as any).currencyCode =
      (this.subscription as { currencyCode?: string }).currencyCode ??
      this.currencyService.primaryCode();
    this.card.set(card);
  }

  onChangeDate(date: any) {
    if (date.firstInputDate) {
      this.card().date = date.firstInputDate;
    }
  }

  updateCardField(field: string, value: any) {
    this.card.update((state: any) => ({
      ...state,
      [field]: value,
    }));
  }

  close(): void {
    this.ref.close();
  }
}
