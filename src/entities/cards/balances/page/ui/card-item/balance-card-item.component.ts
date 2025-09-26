import { BalanceCard, RoutePaths } from '@/shared';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'balance-card-item',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './balance-card-item.component.html',
  styleUrl: `./balance-card-item.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardItemComponent {
  router = inject(Router);
  item = input.required<BalanceCard>();

  handleCheckDetails() {
    this.router.navigate([RoutePaths.BALANCE_DETAILS, this.item().id]);
  }
}
