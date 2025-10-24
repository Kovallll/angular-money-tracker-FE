import { Component, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../card';
import { BalanceCard } from '@/shared';

@Component({
  selector: 'card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss'],
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent],
})
export class CardDetailsComponent {
  card = input<BalanceCard | null>(null);
}
