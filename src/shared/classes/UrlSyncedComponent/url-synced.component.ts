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
  private prevFingerprint = '';

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
    this.prevFingerprint = this.dataFingerprint(this.allData());
    this.sync();
  }

  ngAfterContentChecked(): void {
    const fingerprint = this.dataFingerprint(this.allData());
    if (fingerprint !== this.prevFingerprint) {
      this.prevFingerprint = fingerprint;
      this.sync();
    }
  }

  /** Подпись массива по длине и id, чтобы не вызывать sync при той же выборке. */
  protected dataFingerprint(data: T[]): string {
    if (data.length === 0) return '0';
    const ids = data.map((x: T) => (x as { id?: number }).id ?? (x as { id?: string }).id ?? '');
    return `${data.length}:${ids.join(',')}`;
  }

  abstract setUpdatedData(updatedData: T[]): void;
}
