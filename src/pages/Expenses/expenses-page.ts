import { Component } from '@angular/core';
import { DashboardStatisticCardComponent } from '@/entities/cards/statistics/dashboard/ui/statistic-card';
import { ExpensesCardsComponent } from '@/widgets/expensesCards/ui/expensesCards.component';

@Component({
  selector: 'app-expenses-page',
  imports: [DashboardStatisticCardComponent, ExpensesCardsComponent],
  templateUrl: './expenses-page.html',
  styleUrl: `./expenses-page.scss`,
})
export class ExpensesPageComponent {}
