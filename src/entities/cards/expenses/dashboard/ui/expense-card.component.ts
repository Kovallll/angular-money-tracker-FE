import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { ExpenseCardItemComponent } from './card-item/expense-card-item.component';
import { ExpenseItem, RoutePaths } from '@/shared';
import { ExpensesService } from '@/widgets/expensesCards/services/expenses.service';

@Component({
  selector: 'dash-expense-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, ExpenseCardItemComponent],
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardExpenseCardComponent {
  title = 'Expenses';
  seeAllPath = RoutePaths.EXPENSES;

  expenses = signal<ExpenseItem[]>(this.expesesService.expenses.slice(0, 6));

  constructor(private readonly expesesService: ExpensesService) {}
}
