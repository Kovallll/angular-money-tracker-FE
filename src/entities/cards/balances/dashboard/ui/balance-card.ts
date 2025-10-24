import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardHeaderComponent, CardBodyComponent } from '../../../card';
import { CommonModule } from '@angular/common';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SlideComponent } from '../../../slider/slide/slide';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { BalancesHttpService, RoutePaths } from '@/shared';

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
  private balancesHttpService = inject(BalancesHttpService);
  title = 'Total Balance';
  cards = this.balancesHttpService.cards;
  seeAllPath = RoutePaths.BAlANCES;

  totalBalance = computed(() => this.cards().reduce((acc, cur) => acc + cur.cardBalance, 0));
}
