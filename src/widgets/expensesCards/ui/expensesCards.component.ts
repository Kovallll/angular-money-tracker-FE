import { ExpenseCardPageComponent } from '@/entities/cards/expenses/page/ui/expense-card.component';
import { ExpensesHttpService } from '@/shared';
import { Component, inject } from '@angular/core';

@Component({
  standalone: true,
  selector: 'expenses-cards',
  templateUrl: './expensesCards.component.html',
  styleUrls: ['./expensesCards.component.scss'],
  imports: [ExpenseCardPageComponent],
})
export class ExpensesCardsComponent {
  private expensesHtppService = inject(ExpensesHttpService);

  categories = this.expensesHtppService.categories;
}
