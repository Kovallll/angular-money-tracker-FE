import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Связка шапки (экспорт PDF) и страницы Statistics: текущий таб и запрос переключения без участия роутера.
 */
@Injectable({ providedIn: 'root' })
export class StatisticsTabCoordinatorService {
  private readonly currentView = signal<'charts' | 'reports'>('charts');

  private readonly chartsRequest = new Subject<void>();
  private readonly reportsRequest = new Subject<void>();

  readonly switchToCharts$ = this.chartsRequest.asObservable();
  readonly switchToReports$ = this.reportsRequest.asObservable();

  setCurrentView(v: 'charts' | 'reports'): void {
    this.currentView.set(v);
  }

  getCurrentView(): 'charts' | 'reports' {
    return this.currentView();
  }

  requestChartsTab(): void {
    this.chartsRequest.next();
  }

  requestReportsTab(): void {
    this.reportsRequest.next();
  }

  resetView(): void {
    this.currentView.set('charts');
  }
}
