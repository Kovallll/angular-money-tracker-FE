import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CategoriesHttpService, CreateTransaction, TransactionsHttpService } from '@/shared';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '@/environments/environment';
import { DatePickerComponent } from '@/entities/date-picker/date-picker.component';
import { Select } from 'primeng/select';
@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, DatePickerComponent, Select],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private transactionsHttpService = inject(TransactionsHttpService);
  private ref = inject(DynamicDialogRef);
  queryClient = inject(QueryClient);
  private categoriesHttpService = inject(CategoriesHttpService);

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  mutation = injectMutation(() => ({
    mutationFn: (transaction: CreateTransaction) =>
      this.transactionsHttpService.createTransaction(transaction),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['transactions'] });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction created successfully',
        life: 3000,
      });
      this.ref.close();
    },
    onError: () => {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create transaction',
        life: 3000,
      });
    },
  }));

  createTransaction(transaction: CreateTransaction) {
    this.mutation.mutate(transaction);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.createTransaction(form.value);
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
      acc[cur.field] = '';
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
