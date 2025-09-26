import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryItem } from '@/shared';
import { ExpensesService } from '@/widgets/expensesCards/services/expenses.service';
import { TableComponent } from '@/entities/table/ui/table.component';

@Component({
  selector: 'expenses-details-page',
  imports: [TableComponent],
  templateUrl: './expenses-details-page.html',
  styleUrl: `./expenses-details-page.scss`,
  standalone: true,
})
export class ExpensesDetailsPageComponent {
  private route = inject(ActivatedRoute);

  category = signal<CategoryItem | null>(null);

  expenses = computed(() => this.category()?.expenses ?? []);

  constructor(expensesService: ExpensesService) {
    const categoryId = this.route.snapshot.paramMap.get('id');

    if (categoryId) {
      const category =
        expensesService.categories.find((item) => item.id === Number(categoryId)) ?? null;
      this.category.set(category);
    }
  }

  get isEmpty() {
    return this.expenses().length === 0;
  }

  displayedCells = signal([
    { cellField: 'date', cellName: 'Date' },
    { cellField: 'title', cellName: 'Title' },
    { cellField: 'amount', cellName: 'Amount' },
  ]);
}
