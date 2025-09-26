import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { cards } from '@/shared/constants';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';

@Component({
  selector: 'balance-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, BalanceCardItemComponent],
  templateUrl: './balance.component.html',
  styleUrl: `./balance.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardComponent {
  title = 'Balances';
  items = signal(cards);
}
