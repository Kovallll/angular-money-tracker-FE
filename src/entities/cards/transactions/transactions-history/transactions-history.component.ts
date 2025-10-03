import { Component, input, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../card';
import { MatTableModule } from '@angular/material/table';
import { Transaction } from '@/shared';
import { TableComponent } from '@/entities/table/ui/table.component';
import { TableCell } from '@/entities/table/lib';

@Component({
  selector: 'transactions-history',
  templateUrl: './transactions-history.component.html',
  styleUrls: ['./transactions-history.component.scss'],
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, MatTableModule, TableComponent],
})
export class TransactionsHistoryComponent {
  title = 'Transactions History';
  displayedCells = signal<TableCell[]>([
    { field: 'date', name: 'Date' },
    { field: 'status', name: 'Status' },
    { field: 'transactionType', name: 'Transaction Type' },
    { field: 'category', name: 'Category' },
    { field: 'receipt', name: 'Receipt' },
    { field: 'amount', name: 'Amount' },
  ]);

  transactions = input<Transaction[]>([]);

  get isEmpty() {
    return this.transactions().length === 0;
  }
}
