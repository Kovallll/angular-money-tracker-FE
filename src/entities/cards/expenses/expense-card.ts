import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths } from '@/shared';
@Component({
  selector: 'expense-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, MatIconModule, CurrencyPipe, MatTabsModule],
  templateUrl: './expense-card.html',
  styleUrl: `./expense-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardComponent {
  title = 'Expenses';

  seeAllPath = RoutePaths.EXPENSES;

  items = [
    {
      id: 0,
      category: 'Auto',
      cost: 1000,
    },
    {
      id: 1,
      category: 'Transport',
      cost: 468,
    },
    {
      id: 2,
      category: 'Food',
      cost: 123,
    },
    {
      id: 3,
      category: 'Shopping',
      cost: 9543,
    },
    {
      id: 4,
      category: 'Entertainments',
      cost: 45,
    },
    {
      id: 5,
      category: 'Other',
      cost: 11,
    },
  ];
}
