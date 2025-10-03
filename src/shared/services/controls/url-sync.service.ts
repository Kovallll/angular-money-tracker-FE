import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UrlSyncService {
  private getControlsFilterData(params: Params) {
    try {
      const filtersStr = decodeURIComponent(params['filters'] || '');
      if (!filtersStr) return null;
      return filtersStr.split(';').map((f) => {
        const [category, value] = f.split(':');
        return { category, value };
      });
    } catch (e) {
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
      return null;
    }
  }

  getFilterSyncData(data: any[], params: Params) {
    const filters = this.getControlsFilterData(params);
    console.log(data, 'data', filters);
    if (!filters?.length) return data;
    return data.filter((item) => filters.every((f) => item[f.category] == f.value)).slice(0);
  }

  getSorterSyncData(data: any[], params: Params) {
    const sorter = this.getControlsSorterData(params);
    if (!sorter || !sorter?.field) return data;
    if (sorter.order === 'desc')
      return data.sort((a, b) => (a[sorter.field] < b[sorter.field] ? 1 : -1)).slice(0);
    return data.sort((a, b) => (a[sorter.field] > b[sorter.field] ? 1 : -1)).slice(0);
  }

  getSearchSyncData(data: any[], params: Params) {
    const search = this.getControlsSearchData(params);
    if (!search || !search?.value) return data;
    return data.filter((item) =>
      item[search.field].toLowerCase().includes(search.value.toLowerCase()),
    );
  }

  getSyncData(data: any[], params: Params) {
    return this.getFilterSyncData(
      this.getSorterSyncData(this.getSearchSyncData(data, params), params),
      params,
    );
  }
}
