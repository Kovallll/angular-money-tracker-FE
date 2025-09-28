import { Component, signal } from '@angular/core';
import { SubscribtionsService } from '../../services/subscribtions.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';

@Component({
  selector: 'subscribe-table',
  templateUrl: './subscribe-table.component.html',
  styleUrls: ['./subscribe-table.component.scss'],
  imports: [DatePipe, DashboardCardComponent, CardBodyComponent, CurrencyPipe],
})
export class SubscribeTableComponent {
  title = 'Subscribtions';

  subscribes = signal(this.subscribtionsService.getSubscribes());

  displayedCells = signal([
    { cellField: 'subscribeDate', cellName: 'Date' },
    { cellField: 'title', cellName: 'Title' },
    { cellField: 'description', cellName: 'Description' },
    { cellField: 'lastCharge', cellName: 'Last charge' },
    { cellField: 'amount', cellName: 'Amount' },
  ]);

  get isEmpty() {
    return this.subscribes().length === 0;
  }

  constructor(private readonly subscribtionsService: SubscribtionsService) {}
}
