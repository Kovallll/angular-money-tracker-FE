import { ExpensesHttpService } from '@/shared';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpensesStatisticsService {
  private expensesHttpService = inject(ExpensesHttpService);

  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }

  categories = this.expensesHttpService.categories;

  getCategoriesChartData(max?: number) {
    const cats = !max
      ? this.categories()
      : this.categories()
          .slice(0, max)
          .sort((a, b) => b.expensesAmount - a.expensesAmount);

    const labels = cats.map((c) => c.title);
    const dataset = cats.map((c) => c.expensesAmount ?? Math.floor(Math.random() * 1000));
    const bgColors = cats.map(() => this.getRandomColor());

    return {
      labels,
      dataset,
      bgColors,
    };
  }
}
