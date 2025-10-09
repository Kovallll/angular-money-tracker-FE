import { Component, computed, inject, Signal, signal } from '@angular/core';
import { SubscribtionsService } from '../../../services/subscribtions.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { TableCell } from '@/entities/table/lib';
import { SubscribeItem, UrlSyncedComponent } from '@/shared';

import { columns, searchProps } from '../lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';

@Component({
  selector: 'subscribe-table',
  templateUrl: './subscribe-table.component.html',
  styleUrls: ['./subscribe-table.component.scss'],
  imports: [
    DatePipe,
    DashboardCardComponent,
    CardBodyComponent,
    CurrencyPipe,
    ControlsComponent,
    TitleCasePipe,
    PaginationComponent,
  ],
})
export class SubscribeTableComponent extends UrlSyncedComponent<SubscribeItem> {
  private readonly subscribtionsService = inject(SubscribtionsService);

  subscribes = signal<SubscribeItem[]>([]);

  allData: Signal<SubscribeItem[]> = computed(() => this.subscribtionsService.getSubscribes());

  displayedCells = signal<TableCell[]>(columns);

  override get isEmpty() {
    return this.subscribes().length === 0;
  }

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.subscribtionsService.getSubscribes(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps,
  }));

  setUpdatedData(updatedData: SubscribeItem[]): void {
    this.subscribes.set(updatedData);
  }
}
