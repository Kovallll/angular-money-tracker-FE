import { CategorizerPrediction, ExpensesOverviewDto, StatisticsPiePeriod } from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@/shared/services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class StatisticsHttpService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  getExpensesOverview(params?: {
    monthsBar?: number;
    topK?: number;
    locale?: string;
    piePeriod?: StatisticsPiePeriod;
    /** Взаимоисключимо с userId: аналитика по групповым транзакциям комнаты. */
    roomId?: string;
  }) {
    const qp: Record<string, string | number> = {};
    if (params?.monthsBar) qp['monthsBar'] = params.monthsBar;
    if (params?.topK) qp['topK'] = params.topK;
    if (params?.locale) qp['locale'] = params.locale;
    if (params?.piePeriod) qp['piePeriod'] = params.piePeriod;
    const rid = params?.roomId?.trim();
    if (rid) {
      qp['roomId'] = rid;
    } else {
      const userId = this.auth.getCurrentUserId();
      if (userId) qp['userId'] = userId;
    }
    return this.http.get<ExpensesOverviewDto>('statistics/expenses/overview', { params: qp });
  }

  /** Предсказание категории по тексту (название транзакции). */
  predict(text: string, opts?: { roomId?: string }) {
    const body: { text: string; roomId?: string } = { text };
    const rid = opts?.roomId?.trim();
    if (rid) body.roomId = rid;
    return this.http.post<CategorizerPrediction>('categorizer/predict', body);
  }
  retrain(full: boolean = false) {
    return this.http.post<any>('categorizer/retrain', { full });
  }
}
