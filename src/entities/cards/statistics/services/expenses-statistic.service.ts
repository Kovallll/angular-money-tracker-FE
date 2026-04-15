import { CategoriesHttpService } from '@/shared';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpensesStatisticsService {
  private categoriesHttpService = inject(CategoriesHttpService);

  private getNetExpense(totalExpenses: number, totalRevenues: number): number {
    return Math.max(0, totalExpenses - totalRevenues);
  }

  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }

  categories = this.categoriesHttpService.categories;

  getCategoriesChartData(max?: number) {
    const normalized = this.categories().map((c) => ({
      ...c,
      netExpense: this.getNetExpense(c.totalExpenses ?? 0, c.totalRevenues ?? 0),
    }));

    const sorted = normalized.sort((a, b) => b.netExpense - a.netExpense);
    const cats = !max ? sorted : sorted.slice(0, max);

    const labels = cats.map((c) => c.title);
    const dataset = cats.map((c) => c.netExpense);
    const bgColors = cats.map(() => this.getRandomColor());

    return {
      labels,
      dataset,
      bgColors,
    };
  }
}
