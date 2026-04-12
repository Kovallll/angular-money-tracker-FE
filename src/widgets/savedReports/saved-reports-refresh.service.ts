import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Signals Saved reports list to reload (e.g. after header export saved a snapshot). */
@Injectable({ providedIn: 'root' })
export class SavedReportsRefreshService {
  private readonly refresh$ = new Subject<void>();

  readonly trigger$ = this.refresh$.asObservable();

  requestRefresh(): void {
    this.refresh$.next();
  }
}
