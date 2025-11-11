import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CreateSubscribeItem, SubscribtionsHttpService, Transaction } from '@/shared';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { environment } from '@/environments/environment';
import { DatePickerComponent } from '@/entities/date-picker/date-picker.component';
import { Select } from 'primeng/select';
import { tap } from 'rxjs';
@Component({
  selector: 'edit-subscription-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, DatePickerComponent, Select],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSubscriptionModalComponent implements OnInit {
  messageService = inject(MessageService);
  private config = inject(DynamicDialogConfig);
  private subscriptionsHttpService = inject(SubscribtionsHttpService);
  private ref = inject(DynamicDialogRef);
  private queryClient = inject(QueryClient);
  subscription = this.config.data as Transaction;

  createSubscription(subscription: CreateSubscribeItem) {
    this.subscriptionsHttpService
      .create(subscription)
      .pipe(
        tap(() => {
          this.ref.close();
          this.queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        }),
      )
      .subscribe();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.createSubscription(form.value);
    }
  }

  isDatePicker = environment.SPA_RUN;

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
