import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private lengthSignal = signal(0);

  length = this.lengthSignal.asReadonly();

  setPage(pageIndex: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: pageIndex + 1 },
      queryParamsHandling: 'merge',
    });
  }

  getCurrentPage(): number {
    const page = this.route.snapshot.queryParamMap.get('page');
    return page ? Number(page) - 1 : 0;
  }

  setLength(length: number): void {
    this.lengthSignal.set(length);
  }

  getLength() {
    return this.lengthSignal();
  }
}
