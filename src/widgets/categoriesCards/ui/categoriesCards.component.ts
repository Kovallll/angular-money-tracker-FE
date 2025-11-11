import { CategoryCardComponent } from '@/entities/cards/categories/page/ui/categories.component';
import { CategoriesHttpService } from '@/shared';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';

import { GategoryAddButtonComponent } from '@/features/categories/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';

@Component({
  selector: 'categories-cards',
  templateUrl: './categories-cards.component.html',
  styleUrls: ['./categories-cards.component.scss'],
  imports: [
    CategoryCardComponent,
    CurrencyPipe,
    GategoryAddButtonComponent,
    CategoryAnaliticsComponent,
  ],
  standalone: true,
})
export class CategoriesCardsComponent {
  private categoriesHttpService = inject(CategoriesHttpService);

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  charts = injectQuery(() => ({
    queryKey: ['charts'],
    queryFn: () => this.categoriesHttpService.getCategoryExpenseLineCharts(),
  }));

  getCurrentChart(id: number) {
    return this.charts.data()?.find((c) => c.categoryId === id);
  }

  overageDeltaCompare = computed(() =>
    this.categoriesHttpService.getOverageDeltaCompare(this.charts.data() ?? []),
  );

  topTransactions = computed(() =>
    this.categoriesHttpService.getTopTransactions(this.categories.data() ?? []),
  );

  totalExpenses = computed(() =>
    this.categoriesHttpService.getTotalExpenses(this.categories.data() ?? []),
  );
}
