import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { defaultFilters, Filter, FilterData, FiltersField } from '../lib';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  private router = inject(Router);

  private filters: Filter[] = defaultFilters;

  getFilters() {
    return this.filters;
  }

  setFilters(filters: Filter[]) {
    this.filters = filters;
  }

  setFilterCategory(category: string, index: number) {
    this.filters[index].category = category;
  }

  setFilterValue(value: string, index: number) {
    this.filters[index].value = value;
  }

  addFilter() {
    this.filters = [...this.filters, { ...defaultFilters[0], id: this.filters.length }];
  }

  removeFilter(index: number) {
    if (this.filters.length === 1) this.filters = defaultFilters;
    else this.filters = this.filters.filter((_, idx) => idx !== index);
  }

  getCategoryOptions(filterFields: FiltersField[]) {
    if (!filterFields) return [];
    return filterFields.map(({ field, name }, idx) => ({
      label: name,
      value: field,
      id: idx,
    }));
  }

  setValueOptions(categoryName: string, data: FilterData[], filterId: number) {
    const unique = [...new Set(data.map((item) => item[categoryName]))];
    const options = unique.map((value, idx) => ({
      label: String(value),
      value: String(value),
      id: idx,
    }));

    this.filters[filterId].valueOptions = options;

    return options;
  }

  private serializeFilters(filters: Filter[]): string {
    return filters
      .filter((f) => f.category && f.value)
      .map((f) => `${f.category}:${f.value}`)
      .join(';');
  }

  clearFilters() {
    this.filters = defaultFilters;
    this.router.navigate([], {
      queryParams: { filters: null },
      queryParamsHandling: 'merge',
    });
  }

  applyFilters() {
    const filtersStr = this.serializeFilters(this.filters);

    this.router.navigate([], {
      queryParams: { filters: encodeURIComponent(filtersStr) },
      queryParamsHandling: 'merge',
    });
  }

  updateFiltersFormUrlParams(data: FilterData[], params: Params): Filter[] {
    const filtersStr = decodeURIComponent(params['filters'] || '');

    if (!filtersStr) {
      this.setFilters(defaultFilters);
      return defaultFilters;
    }

    const paramsFilters = filtersStr.split(';').map((f, idx) => {
      const [category, value] = f.split(':');
      return { category, value, valueOptions: [], id: idx };
    });
    this.filters = paramsFilters;

    const filters = paramsFilters.map((f) => {
      const options = this.setValueOptions(f.category, data, f.id);
      return { ...f, valueOptions: options };
    });
    this.filters = filters;
    return filters;
  }
}
