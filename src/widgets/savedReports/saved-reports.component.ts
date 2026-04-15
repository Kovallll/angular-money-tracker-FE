import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnalyticsSnapshotsHttpService, ListSnapshotsParams } from '@/shared';
import { SavedReportsRefreshService } from './saved-reports-refresh.service';
import type { AnalyticsSnapshotItem, AnalyticsSnapshotsListResponse } from '@/shared/types';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { SnapshotViewDialogComponent } from './snapshot-view-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'app-saved-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterModule, DynamicDialogModule, TranslateModule],
  providers: [DialogService],
  templateUrl: './saved-reports.component.html',
  styleUrl: './saved-reports.component.scss',
})
export class SavedReportsComponent {
  private snapshotsHttp = inject(AnalyticsSnapshotsHttpService);
  private dialogService = inject(DialogService);
  private refreshBus = inject(SavedReportsRefreshService);
  private i18n = inject(I18nService);

  loading = signal(false);
  listResponse = signal<AnalyticsSnapshotsListResponse | null>(null);
  searchQuery = signal('');
  periodTypeFilter = signal<'week' | 'month' | 'quarter' | ''>('');
  dateFrom = signal('');
  dateTo = signal('');
  sortOrder = signal<'asc' | 'desc'>('desc');
  page = signal(1);
  limit = 20;

  items = computed(() => this.listResponse()?.items ?? []);
  total = computed(() => this.listResponse()?.total ?? 0);
  totalPages = computed(() => this.listResponse()?.totalPages ?? 0);
  hasFilters = computed(
    () =>
      !!(this.searchQuery().trim() || this.periodTypeFilter() || this.dateFrom() || this.dateTo()),
  );

  constructor() {
    this.load();
    this.refreshBus.trigger$.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    const params: ListSnapshotsParams = {
      page: this.page(),
      limit: this.limit,
      sortBy: 'createdAt',
      sortOrder: this.sortOrder(),
    };
    if (this.periodTypeFilter()) {
      params.periodType = this.periodTypeFilter() as 'week' | 'month' | 'quarter';
    }
    if (this.dateFrom()) params.dateFrom = this.dateFrom();
    if (this.dateTo()) params.dateTo = this.dateTo();
    if (this.searchQuery().trim()) params.search = this.searchQuery().trim();

    this.snapshotsHttp.list(params).subscribe({
      next: (res) => {
        this.listResponse.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.load();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.load();
  }

  onSortChange(order: 'asc' | 'desc'): void {
    this.sortOrder.set(order);
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.periodTypeFilter.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.sortOrder.set('desc');
    this.page.set(1);
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  openSnapshot(snapshot: AnalyticsSnapshotItem): void {
    const period = this.formatPeriod(snapshot);
    const type = this.i18n.t(this.formatPeriodTypeKey(snapshot.periodType));
    this.dialogService.open(SnapshotViewDialogComponent, {
      header: `${this.i18n.t('savedReports.reportPrefix')}: ${period} (${type})`,
      width: '90vw',
      closable: true,
      dismissableMask: true,
      breakpoints: {
        '960px': '95vw',
      },
      data: { snapshot },
    });
  }

  formatDate(iso: string): string {
    const locale = this.i18n.currentLang() === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(iso).toLocaleString(locale);
  }

  formatPeriod(item: AnalyticsSnapshotItem): string {
    const locale = this.i18n.currentLang() === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(item.periodEnd).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  }

  formatPeriodTypeKey(periodType: 'week' | 'month' | 'quarter'): string {
    return `savedReports.periodType.${periodType}`;
  }
}
