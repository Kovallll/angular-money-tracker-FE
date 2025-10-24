import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { BalancesHttpService } from '@/shared';

@Component({
  selector: 'balance-card',
  standalone: true,
  imports: [DashboardCardComponent, CardBodyComponent, BalanceCardItemComponent],
  templateUrl: './balance.component.html',
  styleUrl: `./balance.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardComponent {
  private balansesHttpService = inject(BalancesHttpService);
  title = 'Balances';
  cards = this.balansesHttpService.cards;
}
