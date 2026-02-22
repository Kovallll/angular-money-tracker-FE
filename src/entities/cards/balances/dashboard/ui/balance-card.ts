import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardCardComponent, CardHeaderComponent, CardBodyComponent } from '../../../card';
import { CommonModule } from '@angular/common';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SlideComponent } from '../../../slider/slide/slide';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { BalancesHttpService, RoutePaths } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';

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
    AppCurrencyPipe,
  ],
  templateUrl: './balance-card.html',
  styleUrl: `./balance-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBalanceCardComponent {
  private balancesHttpService = inject(BalancesHttpService);
  readonly currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  title = 'Total Balance';
  cards = this.balancesHttpService.cards;
  seeAllPath = RoutePaths.BAlANCES;

  /** Total balance converted to primary currency. */
  totalBalancePrimary = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.cards().reduce((acc, cur) => {
      const code = cur.currencyCode ?? primary;
      return acc + this.exchangeRates.convert(cur.cardBalance, code, primary);
    }, 0);
  });

  /** Total balance converted to secondary currency. */
  totalBalanceSecondary = computed(() => {
    const primary = this.currencyService.primaryCode();
    const secondary = this.currencyService.secondaryCode();
    return this.cards().reduce((acc, cur) => {
      const code = cur.currencyCode ?? primary;
      return acc + this.exchangeRates.convert(cur.cardBalance, code, secondary);
    }, 0);
  });
}
