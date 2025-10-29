import { ExpensesOverviewDto } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StatisticsHttpService {
  private http = inject(HttpClient);

  getExpensesOverview(params?: { monthsBar?: number; topK?: number; locale?: string }) {
    const qp: any = {};
    if (params?.monthsBar) qp.monthsBar = params.monthsBar;
    if (params?.topK) qp.topK = params.topK;
    if (params?.locale) qp.locale = params.locale;
    return this.http.get<ExpensesOverviewDto>('statistics/expenses/overview', { params: qp });
  }
}
