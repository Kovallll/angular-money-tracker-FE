import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { ExpenseCardItemComponent } from './card-item/expense-card-item.component';
import { ExpensesHttpService, RoutePaths } from '@/shared';

@Component({
  selector: 'dash-expense-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, ExpenseCardItemComponent],
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardExpenseCardComponent {
  private expesesHttpService = inject(ExpensesHttpService);
  seeAllPath = RoutePaths.EXPENSES;

  expenses = computed(() => this.expesesHttpService.expenses().slice(0, 6));
}
