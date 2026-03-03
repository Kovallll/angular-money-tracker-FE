import { Component } from '@angular/core';
import { ExpensesCardsComponent } from '@/widgets/expensesCards/ui/expensesCards.component';

@Component({
  selector: 'app-expenses-page',
  imports: [ExpensesCardsComponent],
  templateUrl: './expenses-page.html',
  styleUrl: `./expenses-page.scss`,
})
export class ExpensesPageComponent {}
