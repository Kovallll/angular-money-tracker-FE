import { UrlSyncService } from '@/shared';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  inject,
  Injectable,
  OnInit,
  Signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class UrlSyncedComponent<T> implements OnInit, AfterContentChecked {
  private urlSync = inject(UrlSyncService);
  abstract allData: Signal<T[]>;
  private prevAllData: T[] = [];

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
    this.prevAllData = this.allData();
    this.sync();
  }

  ngAfterContentChecked(): void {
    if (this.allData() !== this.prevAllData) {
      this.prevAllData = this.allData();
      this.sync();
    }
  }

  abstract setUpdatedData(updatedData: T[]): void;
}
