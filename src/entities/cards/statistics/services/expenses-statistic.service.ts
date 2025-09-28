import { categories } from '@/shared';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExpensesStatisticsService {
  private getRandomColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  }

  getCategoriesChartData(max?: number) {
    const cats = !max
      ? categories
      : categories.slice(0, max).sort((a, b) => b.expensesAmount - a.expensesAmount);

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
