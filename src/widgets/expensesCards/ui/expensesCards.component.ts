import { ExpenseCardPageComponent } from '@/entities/cards/expenses/page/ui/expense-card.component';
import { Component } from '@angular/core';
import { ExpensesService } from '../services/expenses.service';

@Component({
  standalone: true,
  selector: 'expenses-cards',
  templateUrl: './expensesCards.component.html',
  styleUrls: ['./expensesCards.component.scss'],
  imports: [ExpenseCardPageComponent],
})
export class ExpensesCardsComponent {
  readonly categories = this.expensesService.categories;

  constructor(private readonly expensesService: ExpensesService) {}
}
