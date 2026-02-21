import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceCard } from '@/shared';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';

@Component({
  selector: 'balance-card-item',
  standalone: true,
  imports: [CommonModule, AssetPathPipe],
  templateUrl: './balance-card-item.component.html',
  styleUrls: ['./balance-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardItemComponent {
  card = input.required<BalanceCard>();
}
