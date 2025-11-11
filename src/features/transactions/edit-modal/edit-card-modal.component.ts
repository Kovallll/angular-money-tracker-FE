import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CategoriesHttpService,
  CreateTransaction,
  Transaction,
  TransactionsHttpService,
} from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '@/environments/environment';
import { DatePickerComponent } from '@/entities/date-picker/date-picker.component';
import { Select } from 'primeng/select';
import { tap } from 'rxjs';
@Component({
  selector: 'edit-transaction-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, DatePickerComponent, Select],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTransactionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private config = inject(DynamicDialogConfig);
  private categoriesHttpService = inject(CategoriesHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
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
          this.ref.close();
          this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }),
      )
      .subscribe();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.updateTransaction(form.value);
    }
  }

  isDatePicker = environment.SPA_RUN;

  inputs = [
    { name: 'date', placeholder: 'Date', field: 'date' },
    { name: 'title', placeholder: 'Title', field: 'title' },
    { name: 'category', placeholder: 'Category', field: 'category' },
    { name: 'type', placeholder: 'Type', field: 'type' },
    { name: 'paymentMethod', placeholder: 'Payment method', field: 'paymentMethod' },
    { name: 'status', placeholder: 'Status', field: 'status' },
    { name: 'transactionType', placeholder: 'Transaction Type', field: 'transactionType' },
    { name: 'receipt', placeholder: 'Receipt', field: 'receipt' },
    { name: 'amount', placeholder: 'Amount', field: 'amount' },
  ];

  card = signal<any>([]);

  ngOnInit() {
    const card = this.inputs.reduce((acc, cur) => {
      acc[cur.field] = this.transaction[cur.field as keyof CreateTransaction];
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
}
