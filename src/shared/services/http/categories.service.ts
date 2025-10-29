import { categoriesUrl, CategoryItem, CategoryLineChartDto } from '@/shared';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CategoriesHttpService {
  private http = inject(HttpClient);

  private categories$ = this.http.get<CategoryItem[]>(categoriesUrl).pipe(shareReplay(1));

  readonly categories = toSignal(this.categories$, { initialValue: [] });

  readonly selectedCategoryId = signal<number | null>(null);

  readonly currentCategory = computed(() => {
    const id = this.selectedCategoryId();
    return this.categories().find((c) => c.id === id) ?? null;
  });

  getCategoryExpenseLineCharts(year = new Date().getFullYear(), top?: number) {
    const params: any = { year, limitToCurrent: 'true' };
    if (top != null) params.top = String(top);
    return this.http.get<CategoryLineChartDto[]>('statistics/categories/line/year', {
      params,
    });
  }

  readonly charts = toSignal(this.getCategoryExpenseLineCharts(new Date().getFullYear()), {
    initialValue: [] as CategoryLineChartDto[],
  });

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
}
