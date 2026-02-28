import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CategoriesHttpService,
  CreateTransaction,
  ExpensesHttpService,
  Transaction,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'edit-transaction-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppButtonComponent,
    MessageModule,
    Select,
    PriceCurrencyFieldComponent,
    AppIconComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTransactionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private expensesHttpService = inject(ExpensesHttpService);
  private config = inject(DynamicDialogConfig);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
  protected currencyService = inject(CurrencyService);
  transaction = this.config.data as Transaction;

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  updateTransaction(transaction: CreateTransaction) {
    this.transactionsHttpService
      .updateTransaction(this.transaction.id, transaction)
      .pipe(
        tap(() => {
          this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
          this.transactionsHttpService.loadTransactions();
          this.expensesHttpService.refreshExpenses();
          this.categoriesHttpService.refreshCategories();
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

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.updateTransaction(form.value);
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
