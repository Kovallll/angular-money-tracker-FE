import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { defaultSorter, Sorter, SortersField } from '../lib';

@Injectable({
  providedIn: 'root',
})
export class SorterService {
  private router = inject(Router);
  private sorter: Sorter = defaultSorter;

  getCategoryOptions(sorterFields: SortersField[]) {
    if (!sorterFields) return [];
    return sorterFields.map(({ field, name }, idx) => ({
      label: name,
      value: field,
      id: idx,
    }));
  }

  private serializeSorters(sorter: Sorter): string {
    return `${sorter.field}:${sorter.order}`;
  }

  getSorter() {
    return this.sorter;
  }

  setSorter(sorter: Sorter) {
    this.sorter = sorter;
  }

  clearSorter() {
    this.sorter = defaultSorter;
    this.router.navigate([], {
      queryParams: { sorter: null },
      queryParamsHandling: 'merge',
    });
  }

  applySorter() {
    const sorterStr = this.serializeSorters(this.sorter);

    this.router.navigate([], {
      queryParams: { sorter: encodeURIComponent(sorterStr) },
      queryParamsHandling: 'merge',
    });
  }

  updateSorterFromUrlParams(params: Params): Sorter {
    const sorterStr = decodeURIComponent(params['sorter'] || '');
    if (!sorterStr) return defaultSorter;
    const [field, order] = sorterStr.split(':');
    const sorter = { field, order } as Sorter;
    this.setSorter(sorter);
    return sorter;
  }
}
