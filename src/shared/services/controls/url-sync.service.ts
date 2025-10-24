import { PaginationService } from '@/entities/pagination/services/pagination.service';
import { defaultPage, defaultPageSize } from '@/shared/constants';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UrlSyncService {
  private route = inject(ActivatedRoute);
  private paginationService = inject(PaginationService);

  private getControlsFilterData(params: Params) {
    try {
      const filtersStr = decodeURIComponent(params['filters'] || '');
      if (!filtersStr) return null;
      return filtersStr.split(';').map((f) => {
        const [category, value] = f.split(':');
        return { category, value };
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private getControlsSorterData(params: Params) {
    try {
      const sorterStr = decodeURIComponent(params['sorter'] || '');
      if (!sorterStr) return null;
      const [field, order] = sorterStr.split(':');
      return { field, order };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private getControlsSearchData(params: Params) {
    try {
      const searchStr = decodeURIComponent(params['search'] || '');
      if (!searchStr) return null;
      const [field, value] = searchStr.split(':');
      return { field, value };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private getControlsPaginationData(params: Params) {
    try {
      const pageStr = decodeURIComponent(params['page'] || '');
      if (!pageStr) return null;
      return pageStr;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  getFilterSyncData(data: any[], params: Params) {
    const filters = this.getControlsFilterData(params);
    if (!filters?.length) return data;
    this.paginationService.setPage(defaultPage);
    return data.filter((item) => filters.every((f) => item[f.category] == f.value)).slice(0);
  }

  getSorterSyncData(data: any[], params: Params) {
    const sorter = this.getControlsSorterData(params);
    if (!sorter || !sorter?.field) return data;
    this.paginationService.setPage(defaultPage);
    if (sorter.order === 'desc')
      return data.sort((a, b) => (a[sorter.field] < b[sorter.field] ? 1 : -1)).slice(0);
    return data.sort((a, b) => (a[sorter.field] > b[sorter.field] ? 1 : -1)).slice(0);
  }

  getSearchSyncData(data: any[], params: Params) {
    const search = this.getControlsSearchData(params);
    if (!search || !search?.value) return data;
    this.paginationService.setPage(defaultPage);
    return data.filter((item) =>
      item[search.field].toLowerCase().includes(search.value.toLowerCase()),
    );
  }

  getPaginationSyncData(data: any[], params: Params, pageSize: number = defaultPageSize) {
    const page = this.getControlsPaginationData(params);
    if (!page) return data;
    this.paginationService.setLength(data.length);
    return data.slice((+page - 1) * pageSize, +page * pageSize);
  }

  getSyncData(data: any[], params: Params, pageSize: number = defaultPageSize) {
    return this.getPaginationSyncData(
      this.getFilterSyncData(
        this.getSorterSyncData(this.getSearchSyncData(data, params), params),
        params,
      ),
      params,
      pageSize,
    );
  }

  syncWithUrl<T>(data: T[], pageSize: number, callback: (updatedData: T[]) => void) {
    this.route.queryParams.subscribe((params) => {
      const updatedData = this.getSyncData(data, params, pageSize);
      callback(updatedData);
    });
  }
}
