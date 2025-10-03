import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private search = '';

  setSearch(search: string) {
    this.search = search;
  }

  getSearch() {
    return this.search;
  }

  clearSearch() {
    this.search = '';
    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(searchField: string) {
    const queries = this.route.snapshot.queryParamMap.get('search');
    if (this.search === '' && queries) {
      this.clearSearch();
      return;
    }
    if (this.search === '') return;

    const searchStr = `${searchField}:${this.search}`;
    this.router.navigate([], {
      queryParams: { search: encodeURIComponent(searchStr) },
      queryParamsHandling: 'merge',
    });
  }

  getSearchFromUrlParams(params: Params) {
    const searchStr = decodeURIComponent(params['search'] || '');
    if (!searchStr) return null;
    const [_, value] = searchStr.split(':');
    const searchValue = value;
    this.setSearch(searchValue);
    return searchValue;
  }
}
