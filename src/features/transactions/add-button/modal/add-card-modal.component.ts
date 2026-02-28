import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  BalancesHttpService,
  CategoriesHttpService,
  CreateTransactionPayload,
  ExpensesHttpService,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppButtonComponent,
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
  private messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private expensesHttpService = inject(ExpensesHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
  private categoriesHttpService = inject(CategoriesHttpService);
  private balancesHttpService = inject(BalancesHttpService);
  protected currencyService = inject(CurrencyService);

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  cards = this.balancesHttpService.cards;

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateTransactionPayload) =>
      this.transactionsHttpService.createTransaction(payload),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
      this.transactionsHttpService.loadTransactions();
      this.expensesHttpService.refreshExpenses();
      this.categoriesHttpService.refreshCategories();
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
    date: string;
    title: string;
    categoryId: string;
    cardId: string;
    type: 'expense' | 'revenue';
    amount: number;
    currencyCode: string;
    description: string;
    paymentMethod?: 'cash' | 'card';
  } = {
    date: new Date().toISOString().slice(0, 10),
    title: '',
    categoryId: '',
    cardId: '',
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

  protected buildPayload(): CreateTransactionPayload {
    const f = this.form;
    return {
      cardId: String(f.cardId),
      categoryId: String(f.categoryId),
      type: f.type,
      amount: Number(f.amount) || 0,
      currencyCode: f.currencyCode ?? this.currencyService.primaryCode(),
      date: f.date,
      title: f.title || undefined,
      description: f.description || undefined,
      paymentMethod: f.paymentMethod || undefined,
    };
  }

  /** When card changes, set currency to card's currency or primary. */
  onCardChange(cardId: string | number): void {
    const id = typeof cardId === 'number' ? cardId : Number(cardId);
    const card = this.cards().find((c) => c.id === id);
    this.form.currencyCode = card?.currencyCode ?? this.currencyService.primaryCode();
  }

  ngOnInit(): void {
    if (!this.form.currencyCode) {
      this.form.currencyCode = this.currencyService.primaryCode();
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
