import { Component } from '@angular/core';
import { BudgetStatisticCardComponent } from '@/entities/cards/statistics/ui/budget/budget-stats.component';
import { ExpensesStatisticCardComponent } from '@/entities/cards/statistics/ui/expenses/expenses-stats.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';

@Component({
  selector: 'app-statistics-page',
  imports: [
    BudgetStatisticCardComponent,
    ExpensesStatisticCardComponent,
    GoalsStatisticCardComponent,
    CategoryAnaliticsComponent,
  ],
  templateUrl: './statistics-page.html',
  styleUrl: `./statistics-page.scss`,
})
export class StatisticsPageComponent {}
