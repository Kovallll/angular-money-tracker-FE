import { CategoriesHttpService, ExpensesHttpService } from '@/shared';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpensesStatisticsService {
  private categoriesHttpService = inject(CategoriesHttpService);

  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }

  categories = this.categoriesHttpService.categories;

  getCategoriesChartData(max?: number) {
    const cats = !max
      ? this.categories()
      : this.categories()
          .sort((a, b) => b.totalExpenses - a.totalExpenses)
          .slice(0, max);

    const labels = cats.map((c) => c.title);
    const dataset = cats.map((c) => c.totalExpenses ?? Math.floor(Math.random() * 1000));
    const bgColors = cats.map(() => this.getRandomColor());

    return {
      labels,
      dataset,
      bgColors,
    };
  }
}
