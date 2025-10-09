import { Component } from '@angular/core';
import { SubscribeTableComponent } from '@/entities/cards/subscribtions/ui/page/ui/subscribe-table.component';

@Component({
  selector: 'app-subscriptions-page',
  imports: [SubscribeTableComponent],
  templateUrl: './subscriptions-page.html',
  styleUrl: `./subscriptions-page.scss`,
})
export class SubscriptionsPageComponent {}
