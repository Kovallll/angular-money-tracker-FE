import { Component, computed, inject, Signal, signal, ViewChild } from '@angular/core';
import { SubscribtionsService } from '../../../services/subscribtions.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { TableCell } from '@/entities/table/lib';
import { SubscribeItem, SubscribtionsHttpService, UrlSyncedComponent } from '@/shared';

import { columns, searchProps } from '../lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { DialogService } from 'primeng/dynamicdialog';
import { EditSubscriptionModalComponent } from '@/features/subscriptions/edit-modal/edit-card-modal.component';
import { SubscriptionAddButtonComponent } from '@/features/subscriptions/add-button/add-card.component';

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
    ContextMenuComponent,
    SubscriptionAddButtonComponent,
  ],
  standalone: true,
  providers: [DialogService],
})
export class SubscribeTableComponent extends UrlSyncedComponent<SubscribeItem> {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;
  private readonly subscribtionsService = inject(SubscribtionsService);
  private readonly subscribeHttpService = inject(SubscribtionsHttpService);

  subscribes = signal<SubscribeItem[]>([]);

  allData: Signal<SubscribeItem[]> = computed(() => this.subscribtionsService.getSubscribes());

  displayedCells = signal<TableCell[]>(columns);

  override get isEmpty() {
    return this.subscribes().length === 0;
  }

  constructor(public dialogService: DialogService) {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscribes.set(this.subscribtionsService.getSubscribes());
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

  openContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.ctxMenu.open(event);
  }

  onDelete(subscribe: SubscribeItem) {
    if (subscribe) {
      this.subscribeHttpService.delete(subscribe.id).subscribe(() => {
        this.subscribeHttpService.loadAll();
      });
    }
  }

  onEdit(subscribe: SubscribeItem) {
    this.dialogService.open(EditSubscriptionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: subscribe,
    });
  }
}
