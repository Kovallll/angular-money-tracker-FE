import { categoriesUrl, CategoryItem, CategoryLineChartDto, CreateCategoryItem } from '@/shared';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesHttpService {
  private http = inject(HttpClient);

  getCategories() {
    return lastValueFrom(this.http.get<CategoryItem[]>(categoriesUrl));
  }

  readonly categories = signal<CategoryItem[]>([]);
  readonly charts = signal<CategoryLineChartDto[]>([]);

  constructor() {
    this.loadCategories();
    this.loadCharts();
  }

  private async loadCategories() {
    const data = await this.getCategories();
    this.categories.set(data);
  }

  private async loadCharts() {
    const data = await this.getCategoryExpenseLineCharts(new Date().getFullYear());
    this.charts.set(data);
  }

  readonly selectedCategoryId = signal<number | null>(null);

  readonly currentCategory = computed(() => {
    const id = this.selectedCategoryId();
    return this.categories().find((c) => c.id === id) ?? null;
  });

  getCategoryExpenseLineCharts(year = new Date().getFullYear(), top?: number) {
    const params: any = { year, limitToCurrent: 'true' };
    if (top != null) params.top = String(top);
    return lastValueFrom(
      this.http.get<CategoryLineChartDto[]>('statistics/categories/line/year', {
        params,
      }),
    );
  }

  getChartDeltaCompare(chart?: CategoryLineChartDto): { value: number; negative: boolean } {
    const data = chart?.datasets?.[0]?.data ?? [];

    const current = data.at(-1) ?? 0;
    const previous = data.at(-2) ?? 0;

    const getDeltaPct = () => {
      const prev = previous;
      if (prev === 0) return { value: 0, negative: false };
      return {
        value: Number(Math.abs(((current - prev) / prev) * 100).toFixed(2)),
        negative: current < prev,
      };
    };
    return getDeltaPct();
  }

  getTotalExpenses(categories: CategoryItem[]) {
    return categories.reduce((acc, cur) => (acc += cur.totalExpenses), 0);
  }

  getTopTransactions(categories: CategoryItem[]): number {
    if (categories.length === 0) return 0;
    const getLengthTransactions = (category: CategoryItem): number => {
      return category.expenses.length + category.revenues.length;
    };
    return getLengthTransactions(
      categories.sort((a, b) => getLengthTransactions(b) - getLengthTransactions(a))[0],
    );
  }

  getOverageDeltaCompare(data: CategoryLineChartDto[]) {
    const delta = data.reduce((acc, cur) => {
      const delta = this.getChartDeltaCompare(cur);
      if (delta.negative) {
        acc -= delta.value;
      } else {
        acc += delta.value;
      }
      return acc;
    }, 0);

    if (delta < 0) return { value: Math.abs(delta).toFixed(2), negative: true };
    return { value: Math.abs(delta).toFixed(2), negative: false };
  }

  createCategory(category: CreateCategoryItem) {
    return lastValueFrom(this.http.post<CreateCategoryItem>(categoriesUrl, category));
  }
}
