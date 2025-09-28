import { Component } from '@angular/core';
import { DashboardBalanceCardComponent } from '@/entities/cards/balances/dashboard/ui/balance-card';
import { DashboardExpenseCardComponent } from '@/entities/cards/expenses/dashboard/ui/expense-card.component';
import { DashboardGoalCardComponent } from '@/entities/cards/goals/dashboard/ui/goal-card';
import { DashboardSubscribeCardComponent } from '@/entities/cards/subscribtions/ui/dashboard/subscribe-card';
import { DashboardTransactionCardComponent } from '@/entities/cards/transactions/dashboard/ui/transaction-card';
import { BudgetStatisticCardComponent } from '@/entities/cards/statistics/ui/budget/budget-stats.component';
import { RoutePaths } from '@/shared';

@Component({
  standalone: true,
  selector: 'dashboard-cards',
  templateUrl: './dashboardCards.component.html',
  styleUrls: ['./dashboardCards.component.scss'],
  imports: [
    DashboardBalanceCardComponent,
    DashboardGoalCardComponent,
    DashboardSubscribeCardComponent,
    DashboardTransactionCardComponent,
    DashboardExpenseCardComponent,
    DashboardBalanceCardComponent,
    BudgetStatisticCardComponent,
  ],
})
export class DashboardCardsComponent {
  seeAllPath = RoutePaths.STATISTICS;
}
