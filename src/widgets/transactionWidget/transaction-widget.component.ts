import { Component } from '@angular/core';
import { TransactionsComponent } from '@/entities/cards/transactions/page/ui/transaction-card.component';

@Component({
  selector: 'transaction-widget',
  templateUrl: './transaction-widget.component.html',
  styleUrls: ['./transaction-widget.component.scss'],
  imports: [TransactionsComponent],
})
export class TransactionWidgetComponent {}
