import { Component } from '@angular/core';
import { TransactionWidgetComponent } from '@/widgets/transactionWidget/transaction-widget.component';

@Component({
  selector: 'app-transactions-page',
  imports: [TransactionWidgetComponent],
  templateUrl: './transactions-page.html',
  styleUrl: `./transactions-page.scss`,
})
export class TransactionsPageComponent {}
