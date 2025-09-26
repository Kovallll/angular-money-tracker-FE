import { Component } from '@angular/core';
import { TransactionsComponent } from '@/entities/cards/transactions/page/ui/transaction-card.component';

@Component({
  selector: 'app-transactions-page',
  imports: [TransactionsComponent],
  templateUrl: './transactions-page.html',
  styleUrl: `./transactions-page.scss`,
})
export class TransactionsPageComponent {}
