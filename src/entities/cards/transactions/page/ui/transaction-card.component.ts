import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatTabsModule } from '@angular/material/tabs';
import { tabs, UrlSyncService } from '@/shared';
import { TransactionsService } from '../../services/transactions.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ActivatedRoute } from '@angular/router';
import { ControlsProps } from '@/widgets/controls/lib';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'transactions',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatTabsModule,
    TableComponent,
    ControlsComponent,
  ],
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  private route = inject(ActivatedRoute);
  private urlSyncService = inject(UrlSyncService);
  private transactionsService = inject(TransactionsService);

  readonly title = 'Transactions';
  readonly tabs = tabs;

  readonly tabFilter = signal('All');
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  readonly transactions = computed(() => this.transactionsService.getAllTransactions());

  readonly currentTransactions = computed(() => {
    const base =
      this.tabFilter() === 'All'
        ? this.transactions()
        : this.transactions().filter((t) => t.type === this.tabFilter());

    return this.urlSyncService.getSyncData(base, this.queryParams());
  });

  readonly displayedCells = signal(this.transactionsService.getDisplayedCells());

  readonly controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.transactions(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'Search by title' },
  }));

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }

  get isEmpty() {
    return this.currentTransactions().length === 0;
  }
}
