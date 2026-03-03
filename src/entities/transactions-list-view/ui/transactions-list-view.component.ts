import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TableComponent } from '@/entities/table/ui/table.component';
import { TableCell } from '@/entities/table/lib';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/** Строка для отображения в списке: таблица или карточки. Минимум: id, date, title, amount. */
export interface TransactionListRow {
  id: number;
  date: string;
  title: string;
  amount: number;
  category?: string;
  categoryIcon?: string;
  type?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'transactions-list-view',
  standalone: true,
  imports: [TableComponent, AppCurrencyPipe, AppIconComponent, DatePipe, MatIconModule],
  templateUrl: './transactions-list-view.component.html',
  styleUrl: './transactions-list-view.component.scss',
})
export class TransactionsListViewComponent {
  dataSource = input.required<TransactionListRow[]>();
  displayedCells = input.required<TableCell[]>();
  isEmpty = input(false);
  /** Показывать кнопку удаления и клик по карточке для редактирования (страница транзакций). */
  showActions = input(false);

  onEdit = output<TransactionListRow>();
  onDelete = output<TransactionListRow>();

  private breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 1199px)').pipe(map((s) => s.matches)),
    { initialValue: false },
  );
}
