import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTableModule } from '@angular/material/table';
import { Transaction, UrlSyncedComponent } from '@/shared';
import { TableComponent } from '@/entities/table/ui/table.component';
import { TableCell } from '@/entities/table/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { columns } from '../lib';

@Component({
  selector: 'transactions-history',
  templateUrl: './transactions-history.component.html',
  styleUrls: ['./transactions-history.component.scss'],
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatTableModule,
    TableComponent,
    PaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsHistoryComponent extends UrlSyncedComponent<Transaction> {
  displayedCells = signal<TableCell[]>(columns);

  transactions = input<Transaction[]>([]);
  currentTransactions = signal<Transaction[]>(this.transactions());

  allData = computed(() => this.transactions());

  override get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  setUpdatedData(updatedData: Transaction[]) {
    this.currentTransactions.set(updatedData);
  }
}
