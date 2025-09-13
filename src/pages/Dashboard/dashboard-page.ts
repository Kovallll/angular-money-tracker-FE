import { Component } from '@angular/core';
import { BalanceCardComponent } from '@/entities/cards/balance/balance-card';
import { GoalCardComponent } from '@/entities/cards/goals/goal-card';
import { SubscribeCardComponent } from '@/entities/cards/subscribes/subscribe-card';
import { TransactionCardComponent } from '@/entities/cards/transactions/transaction-card';
import { StatisticCardComponent } from '@/entities/cards/statistics/statistic-card';
import { ExpenseCardComponent } from '@/entities/cards/expenses/expense-card';

@Component({
  selector: 'dashboard-page',
  imports: [
    BalanceCardComponent,
    GoalCardComponent,
    SubscribeCardComponent,
    TransactionCardComponent,
    StatisticCardComponent,
    ExpenseCardComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: `./dashboard-page.scss`,
})
export class DashboardPageComponent {}
