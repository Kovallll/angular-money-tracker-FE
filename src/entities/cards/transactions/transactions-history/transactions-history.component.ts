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
    { cellField: 'date', cellName: 'Date' },
    { cellField: 'status', cellName: 'Status' },
    { cellField: 'transactionType', cellName: 'Transaction Type' },
    { cellField: 'category', cellName: 'Category' },
    { cellField: 'receipt', cellName: 'Receipt' },
    { cellField: 'amount', cellName: 'Amount' },
  ]);

  transactions = input<Transaction[]>([]);

  get isEmpty() {
    return this.transactions().length === 0;
  }
}
