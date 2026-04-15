import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTableModule } from '@angular/material/table';
import { CategoriesHttpService, Transaction, UrlSyncedComponent } from '@/shared';
import { TableCell } from '@/entities/table/lib';
import {
  TransactionsListViewComponent,
  type TransactionListRow,
} from '@/entities/transactions-list-view';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { columns } from '../lib';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'transactions-history',
  templateUrl: './transactions-history.component.html',
  styleUrls: ['./transactions-history.component.scss'],
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatTableModule,
    TransactionsListViewComponent,
    PaginationComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsHistoryComponent extends UrlSyncedComponent<Transaction> {
  private categoriesHttpService = inject(CategoriesHttpService);

  displayedCells = signal<TableCell[]>(columns);

  transactions = input<Transaction[]>([]);
  currentTransactions = signal<Transaction[]>([]);

  /** Данные для списка (таблица/карточки): подставляем название и иконку категории по categoryId. */
  listRows = computed<TransactionListRow[]>(() => {
    const list = this.currentTransactions();
    const categories = this.categoriesHttpService.categories();
    return list.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return {
        ...t,
        id: t.id,
        date: t.date,
        title: t.title,
        amount: t.amount,
        category: (t.category || cat?.title) ?? '—',
        categoryIcon: cat?.icon ?? '',
        type: t.type,
      };
    });
  });

  constructor() {
    super();
    effect(() => this.currentTransactions.set(this.transactions()));
  }

  allData = computed(() => this.transactions());

  override get isEmpty() {
    return this.currentTransactions().length === 0;
  }

  setUpdatedData(updatedData: Transaction[]) {
    this.currentTransactions.set(updatedData);
  }
}
