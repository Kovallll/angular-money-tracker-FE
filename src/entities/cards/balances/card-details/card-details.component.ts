import { Component, computed, inject, input } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../card';
import { BalanceCard } from '@/shared';
import { BalanceRemoveCardButtonComponent } from '@/features/balance/remove-card/remove-card.component';
import { BalanceEditCardButtonComponent } from '@/features/balance/edit-card/edit-card.component';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

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
    AppCurrencyPipe,
  ],
})
export class CardDetailsComponent {
  card = input<BalanceCard | null>(null);
  readonly currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  /** Card balance in app primary currency (main line). */
  balancePrimary = computed(() => {
    const c = this.card();
    if (!c) return 0;
    const primary = this.currencyService.primaryCode();
    const code = c.currencyCode ?? primary;
    return this.exchangeRates.convert(c.cardBalance, code, primary);
  });

  /** Card balance in app secondary currency (second line). */
  balanceSecondary = computed(() => {
    const c = this.card();
    if (!c) return 0;
    const primary = this.currencyService.primaryCode();
    const secondary = this.currencyService.secondaryCode();
    const code = c.currencyCode ?? primary;
    return this.exchangeRates.convert(c.cardBalance, code, secondary);
  });
}
