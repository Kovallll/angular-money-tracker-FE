import { ExpensesOverviewDto } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class StatisticsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  getExpensesOverview(params?: { monthsBar?: number; topK?: number; locale?: string }) {
    const qp: Record<string, string | number> = {};
    if (params?.monthsBar) qp['monthsBar'] = params.monthsBar;
    if (params?.topK) qp['topK'] = params.topK;
    if (params?.locale) qp['locale'] = params.locale;
    const userId = this.auth.getCurrentUserId();
    if (userId) qp['userId'] = userId;
    return this.http.get<ExpensesOverviewDto>('statistics/expenses/overview', { params: qp });
  }

  getCategories(title: string) {
    return this.http.post<any>('classify', { title });
  }

  updateCategory(id: string, dto: any) {
    return this.http.patch<any>(`classify/${id}`, dto);
  }

  createCategory(obj: any) {
    const { name, synonyms, description } = obj;
    return this.http.post<any>('categories/predict', { name, synonyms, description });
  }

  predict(text: string) {
    return this.http.post<any>('categorizer/predict', { text });
  }
  retrain(full: boolean = false) {
    return this.http.post<any>('categorizer/retrain', { full });
  }
}
