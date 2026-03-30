import { categoriesUrl, CategoryItem, CategoryLineChartDto, CreateCategoryItem } from '@/shared';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  /** Список категорий текущего пользователя */
  getCategories(): Promise<CategoryItem[]> {
    const userId = this.auth.getCurrentUserId();
    if (!userId) return Promise.resolve([]);
    return lastValueFrom(this.http.get<CategoryItem[]>(`${categoriesUrl}/user/${userId}`));
  }

  readonly categories = signal<CategoryItem[]>([]);
  readonly charts = signal<CategoryLineChartDto[]>([]);
  readonly isLoading = signal(false);

  constructor() {
    this.loadCategories();
    this.loadCharts();
  }

  async loadCategories() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      this.categories.set([]);
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    try {
      const data = await lastValueFrom(
        this.http.get<CategoryItem[]>(`${categoriesUrl}/user/${userId}`),
      );
      this.categories.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Принудительно обновить категории (после добавления/редактирования/удаления транзакции). */
  refreshCategories(): void {
    this.loadCategories();
  }

  private async loadCharts() {
    const userId = this.auth.getCurrentUserId();
    const data = await this.getCategoryExpenseLineCharts(
      new Date().getFullYear(),
      undefined,
      userId ?? undefined,
    );
    this.charts.set(data);
  }

  readonly selectedCategoryId = signal<number | null>(null);

  readonly currentCategory = computed(() => {
    const id = this.selectedCategoryId();
    return this.categories().find((c) => c.id === id) ?? null;
  });

  getCategoryExpenseLineCharts(
    year = new Date().getFullYear(),
    top?: number,
    userId?: string,
    roomId?: string,
  ) {
    const params: Record<string, string> = { year: String(year), limitToCurrent: 'true' };
    if (top != null) params['top'] = String(top);
    const rid = roomId?.trim();
    if (rid) params['roomId'] = rid;
    else if (userId) params['userId'] = userId;
    return lastValueFrom(
      this.http.get<CategoryLineChartDto[]>('statistics/categories/line/year', { params }),
    );
  }

  getChartDeltaCompare(chart?: CategoryLineChartDto): {
    value: number;
    negative: boolean;
    comparable: boolean;
  } {
    const raw = chart?.datasets?.[0]?.data ?? [];
    const values = raw.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
    if (!values.length) return { value: 0, negative: false, comparable: false };

    const current = values.at(-1) ?? 0;
    const previous = values.length > 1 ? (values.at(-2) ?? 0) : 0;

    // N/A, если в одном из месяцев нет транзакций (0): не показываем 0%, 100% или -100%
    if (previous === 0 || current === 0) {
      return { value: 0, negative: false, comparable: false };
    }

    const delta = ((current - previous) / previous) * 100;
    const value = Number(Math.abs(delta).toFixed(2));
    return { value, negative: current < previous, comparable: true };
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

  /** Сумма процентов по категориям (старая логика). Оставлено для совместимости при необходимости. */
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

    if (delta < 0) return { value: Math.abs(delta).toFixed(2), negative: true, comparable: true };
    return { value: Math.abs(delta).toFixed(2), negative: false, comparable: true };
  }

  /**
   * Сравнение общих расходов: сумма по всем категориям за текущий месяц vs за предыдущий.
   * Процент изменения = (текущая сумма − предыдущая) / предыдущая * 100.
   * N/A, если в одном из месяцев сумма 0.
   */
  getTotalExpensesVsLastMonth(data: CategoryLineChartDto[]): {
    value: string;
    negative: boolean;
    comparable: boolean;
  } {
    let totalCurrent = 0;
    let totalPrevious = 0;
    for (const chart of data) {
      const raw = chart?.datasets?.[0]?.data ?? [];
      const values = raw.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
      if (values.length > 0) totalCurrent += values.at(-1) ?? 0;
      if (values.length > 1) totalPrevious += values.at(-2) ?? 0;
    }
    if (totalPrevious === 0 || totalCurrent === 0) {
      return { value: '0', negative: false, comparable: false };
    }
    const percent = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
    const value = Math.abs(percent).toFixed(2);
    const negative = totalCurrent < totalPrevious;
    return { value, negative, comparable: true };
  }

  createCategory(category: CreateCategoryItem) {
    return lastValueFrom(
      this.http.post<CreateCategoryItem>(categoriesUrl, {
        name: category.title,
        icon: category.icon,
      }),
    );
  }

  updateCategory(id: number | string, category: CreateCategoryItem) {
    return lastValueFrom(
      this.http.patch<CreateCategoryItem>(`${categoriesUrl}/${id}`, {
        name: category.title,
        icon: category.icon,
      }),
    );
  }

  deleteCategory(id: number | string, reassignTo?: string) {
    const options = reassignTo ? { params: { reassignTo } } : {};
    return lastValueFrom(this.http.delete(`${categoriesUrl}/${id}`, options));
  }

  fetchCategoriesByRoom(roomId: string): Promise<CategoryItem[]> {
    return lastValueFrom(this.http.get<CategoryItem[]>(`${categoriesUrl}/room/${roomId}`));
  }

  createCategoryInRoom(roomId: string, category: CreateCategoryItem): Promise<CategoryItem> {
    return lastValueFrom(
      this.http.post<CategoryItem>(`${categoriesUrl}/room/${roomId}`, {
        name: category.title,
        icon: category.icon,
      }),
    );
  }
}
