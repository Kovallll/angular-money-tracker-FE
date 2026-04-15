import { ChangeDetectionStrategy, Component, computed, HostBinding, inject } from '@angular/core';
import { DashboardCardComponent, CardHeaderComponent, CardBodyComponent } from '../../../card';
import { CommonModule } from '@angular/common';
import { BalanceCardItemComponent } from './card-item/balance-card-item.component';
import { BalancesHttpService, RoutePaths } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Carousel } from 'primeng/carousel';
import { DASHBOARD_CAROUSEL_RESPONSIVE } from '../../../slider/lib/carousel-options';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'dash-balance-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CommonModule,
    Carousel,
    BalanceCardItemComponent,
    AppCurrencyPipe,
    ProgressSpinner,
    AppIconComponent,
    TranslatePipe,
  ],
  templateUrl: './balance-card.html',
  styleUrl: `./balance-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBalanceCardComponent {
  private balancesHttpService = inject(BalancesHttpService);
  readonly currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  title = 'dashboard.totalBalance';
  cards = this.balancesHttpService.cards;
  isLoading = this.balancesHttpService.isLoading;
  seeAllPath = RoutePaths.BAlANCES;
  carouselResponsive = DASHBOARD_CAROUSEL_RESPONSIVE;

  /** Один слайд — нет стрелок, блок может быть уже */
  @HostBinding('class.carousel-single') get isCarouselSingle(): boolean {
    return this.cards().length <= 1;
  }

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
