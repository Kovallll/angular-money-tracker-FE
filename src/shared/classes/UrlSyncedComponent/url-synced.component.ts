import { UrlSyncService } from '@/shared';
import { inject, Injectable, OnInit, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class UrlSyncedComponent<T> implements OnInit {
  private urlSync = inject(UrlSyncService);
  abstract allData: Signal<T[]>;

  pageSize = 10;

  initPageSize(size: number) {
    this.pageSize = size;
  }

  sync() {
    this.urlSync.syncWithUrl(this.allData(), this.pageSize, (updatedData) => {
      this.setUpdatedData(updatedData);
    });
  }

  get isEmpty() {
    return this.allData().length === 0;
  }

  ngOnInit(): void {
    this.sync();
  }

  abstract setUpdatedData(updatedData: T[]): void;
}
