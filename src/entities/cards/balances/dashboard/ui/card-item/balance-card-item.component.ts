import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceCard } from '@/shared';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

@Component({
  selector: 'balance-card-item',
  standalone: true,
  imports: [CommonModule, AssetPathPipe, AppCurrencyPipe],
  templateUrl: './balance-card-item.component.html',
  styleUrls: ['./balance-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardItemComponent {
  card = input.required<BalanceCard>();
  readonly currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  /** Card balance in app primary currency (main line). */
  balancePrimary = computed(() => {
    const c = this.card();
    const primary = this.currencyService.primaryCode();
    const code = c.currencyCode ?? primary;
    return this.exchangeRates.convert(c.cardBalance, code, primary);
  });

  /** Card balance in app secondary currency (second line). */
  balanceSecondary = computed(() => {
    const c = this.card();
    const primary = this.currencyService.primaryCode();
    const secondary = this.currencyService.secondaryCode();
    const code = c.currencyCode ?? primary;
    return this.exchangeRates.convert(c.cardBalance, code, secondary);
  });
}
