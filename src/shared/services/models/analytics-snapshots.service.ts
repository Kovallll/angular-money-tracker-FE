import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AnalyticsSnapshotItem, AnalyticsSnapshotsListResponse } from '@/shared/types';

export type PeriodType = 'week' | 'month' | 'quarter';

export interface ListSnapshotsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  periodType?: PeriodType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsSnapshotsHttpService {
  private http = inject(HttpClient);

  list(params?: ListSnapshotsParams) {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params?.periodType) httpParams = httpParams.set('periodType', params.periodType);
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<AnalyticsSnapshotsListResponse>('analytics-snapshots', {
      params: httpParams,
    });
  }

  getById(id: string) {
    return this.http.get<AnalyticsSnapshotItem>(`analytics-snapshots/${id}`);
  }
}
