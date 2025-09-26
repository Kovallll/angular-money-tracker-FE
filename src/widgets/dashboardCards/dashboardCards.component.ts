import { Component } from '@angular/core';
import { DashboardBalanceCardComponent } from '@/entities/cards/balances/dashboard/ui/balance-card';
import { DashboardExpenseCardComponent } from '@/entities/cards/expenses/dashboard/ui/expense-card.component';
import { DashboardGoalCardComponent } from '@/entities/cards/goals/dashboard/ui/goal-card';
import { DashboardStatisticCardComponent } from '@/entities/cards/statistics/dashboard/ui/statistic-card';
import { DashboardSubscribeCardComponent } from '@/entities/cards/subscribtions/dashboard/ui/subscribe-card';
import { DashboardTransactionCardComponent } from '@/entities/cards/transactions/dashboard/ui/transaction-card';

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
    DashboardStatisticCardComponent,
    DashboardExpenseCardComponent,
    DashboardBalanceCardComponent,
  ],
})
export class DashboardCardsComponent {}
