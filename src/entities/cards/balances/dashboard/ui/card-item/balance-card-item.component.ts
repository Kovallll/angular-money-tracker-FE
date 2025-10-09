import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceCard } from '@/shared';

@Component({
  selector: 'balance-card-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-card-item.component.html',
  styleUrls: ['./balance-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardItemComponent {
  item = input.required<BalanceCard>();
}
