import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  BalancesHttpService,
  CategoriesHttpService,
  CreateTransactionPayload,
  TransactionsHttpService,
} from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    Select,
    InputNumber,
    DatePickerModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionModalComponent implements OnInit {
  private messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
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
  } = {
    date: new Date().toISOString().slice(0, 10),
    title: '',
    categoryId: '',
    cardId: '',
    type: 'expense',
    amount: 0,
    currencyCode: '',
    description: '',
  };

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
      currencyCode: f.currencyCode || this.currencyService.primaryCode(),
      date: f.date,
      title: f.title || undefined,
      description: f.description || undefined,
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
}
