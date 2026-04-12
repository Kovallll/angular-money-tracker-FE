import { Component, input, signal } from '@angular/core';
import { DashboardBalanceCardComponent } from '@/entities/cards/balances/dashboard/ui/balance-card';
import { DashboardExpenseCardComponent } from '@/entities/cards/expenses/dashboard/ui/expense-card.component';
import { DashboardGoalCardComponent } from '@/entities/cards/goals/dashboard/ui/goal-card';
import { DashboardSubscribeCardComponent } from '@/entities/cards/subscribtions/ui/dashboard/subscribe-card';
import { DashboardTransactionCardComponent } from '@/entities/cards/transactions/dashboard/ui/transaction-card';
import { BudgetStatisticCardComponent } from '@/entities/cards/statistics/ui/budget/budget-stats.component';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';
import { RoutePaths } from '@/shared';
import { SelectOption } from '@/entities/select/lib';
import { ChartViews } from '@/entities/cards/statistics/lib';

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
    BudgetStatisticCardComponent,
    CategoryAnaliticsComponent,
  ],
})
export class DashboardCardsComponent {
  /** Групповая комната: те же блоки, данные по комнате (без личных карт и топ-расходов). */
  groupRoomId = input<string | undefined>(undefined);

  seeAllPath = RoutePaths.STATISTICS;
  fixedView = signal<SelectOption<`${ChartViews}`>>({
    label: ChartViews.WEEK,
    value: ChartViews.WEEK,
    id: 1,
  });
}
