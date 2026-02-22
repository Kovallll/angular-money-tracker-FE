import { ExpenseCardPageComponent } from '@/entities/cards/expenses/page/ui/expense-card.component';
import { CategoriesHttpService } from '@/shared';
import { Component, computed, inject } from '@angular/core';

@Component({
  standalone: true,
  selector: 'expenses-cards',
  templateUrl: './expensesCards.component.html',
  styleUrls: ['./expensesCards.component.scss'],
  imports: [ExpenseCardPageComponent],
})
export class ExpensesCardsComponent {
  private categoriesHttpService = inject(CategoriesHttpService);

  categories = this.categoriesHttpService.categories;
  hasAnyExpenses = computed(() => this.categories().some((c) => (c.expenses?.length ?? 0) > 0));
}
