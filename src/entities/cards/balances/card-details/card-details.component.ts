import { Component, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../card';
import { BalanceCard } from '@/shared';
import { BalanceRemoveCardButtonComponent } from '@/features/balance/remove-card/remove-card.component';
import { BalanceEditCardButtonComponent } from '@/features/balance/edit-card/edit-card.component';

@Component({
  selector: 'card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss'],
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BalanceRemoveCardButtonComponent,
    BalanceEditCardButtonComponent,
  ],
})
export class CardDetailsComponent {
  card = input<BalanceCard | null>(null);
}
