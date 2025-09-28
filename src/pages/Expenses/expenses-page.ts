import { Component } from '@angular/core';
import { ExpensesCardsComponent } from '@/widgets/expensesCards/ui/expensesCards.component';
import { ExpensesStatisticCardComponent } from '@/entities/cards/statistics/ui/expenses/expenses-stats.component';

@Component({
  selector: 'app-expenses-page',
  imports: [ExpensesCardsComponent, ExpensesStatisticCardComponent],
  templateUrl: './expenses-page.html',
  styleUrl: `./expenses-page.scss`,
})
export class ExpensesPageComponent {}
