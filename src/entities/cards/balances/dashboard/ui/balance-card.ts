import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DashboardCardComponent, CardHeaderComponent, CardBodyComponent } from '../../../card';
import { CommonModule } from '@angular/common';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SlideComponent } from '../../../slider/slide/slide';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { cards } from '@/shared/constants';
import { BalanceCard, RoutePaths } from '@/shared';

@Component({
  selector: 'dash-balance-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CommonModule,
    SliderCardComponent,
    SlideComponent,
    BalanceCardItemComponent,
  ],
  templateUrl: './balance-card.html',
  styleUrl: `./balance-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBalanceCardComponent {
  title = 'Total Balance';
  items = signal<BalanceCard[]>(cards);
  seeAllPath = RoutePaths.BAlANCES;

  totalBalance = computed(() => this.items().reduce((acc, cur) => acc + cur.cardBalance, 0));
}
