import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { PaginationService } from '../services/pagination.service';
import { ActivatedRoute } from '@angular/router';
import { defaultPage, defaultPageSize } from '@/shared';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  imports: [MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paginationService = inject(PaginationService);

  pageSize = input(defaultPageSize);
  pageIndex = signal(defaultPage);
  length = this.paginationService.length;

  constructor() {
    effect(() => {
      const currentPage = this.paginationService.getCurrentPage();
      const totalPages = this.totalPages();
      if (currentPage >= totalPages && totalPages > 0) {
        this.setPage(defaultPage);
      }
    });
  }

  totalPages = computed(() => Math.ceil(this.length() / this.pageSize()));

  handlePageEvent(e: PageEvent) {
    this.setPage(e.pageIndex);
  }

  setPage(pageIndex: number) {
    this.pageIndex.set(pageIndex);
    this.paginationService.setPage(pageIndex);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const currentPage = this.paginationService.getCurrentPage();

      if (!params['page']) {
        this.paginationService.setPage(currentPage);
      }

      this.pageIndex.set(currentPage);
    });
  }
}
