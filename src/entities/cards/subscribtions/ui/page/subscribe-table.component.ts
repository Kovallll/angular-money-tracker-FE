import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SubscribtionsService } from '../../services/subscribtions.service';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { TableCell } from '@/entities/table/lib';
import { UrlSyncService } from '@/shared';
import { ActivatedRoute } from '@angular/router';

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
  ],
})
export class SubscribeTableComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly urlSyncService = inject(UrlSyncService);
  private readonly subscribtionsService = inject(SubscribtionsService);

  subscribes = signal(this.subscribtionsService.getSubscribes());

  displayedCells = signal<TableCell[]>([
    { field: 'subscribeDate', name: 'Date' },
    { field: 'subscribeName', name: 'Title' },
    { field: 'description', name: 'Description' },
    { field: 'type', name: 'Type' },
    { field: 'lastCharge', name: 'Last charge' },
    { field: 'amount', name: 'Amount' },
  ]);

  get isEmpty() {
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
    searchProps: { searchField: 'subscribeName', placeholder: 'Search by title' },
  }));

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const subscribes = this.urlSyncService.getSyncData(
        this.subscribtionsService.getSubscribes(),
        params,
      );
      this.subscribes.set(subscribes);
    });
  }
}
