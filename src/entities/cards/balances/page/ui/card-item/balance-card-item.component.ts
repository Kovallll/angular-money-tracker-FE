import { BalanceCard, RoutePaths } from '@/shared';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { BalancesHttpService } from '@/shared/services/models/balances.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'balance-card-item',
  standalone: true,
  imports: [AssetPathPipe, AppCurrencyPipe],
  templateUrl: './balance-card-item.component.html',
  styleUrl: `./balance-card-item.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardItemComponent {
  router = inject(Router);
  card = input.required<BalanceCard>();
  readonly currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private balancesHttp = inject(BalancesHttpService);
  private messageService = inject(MessageService);
  settingPrimary = signal(false);

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

  handleCheckDetails() {
    this.router.navigate([RoutePaths.BALANCE_DETAILS, this.card().id]);
  }

  setAsPrimary($event: Event) {
    $event.stopPropagation();
    if (this.card().isPrimary || this.settingPrimary()) return;
    this.settingPrimary.set(true);
    this.balancesHttp.setPrimaryCard(this.card().id).subscribe({
      next: () => {
        this.settingPrimary.set(false);
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Primary card',
          detail: 'This card is now used for automatic transactions.',
          life: 3000,
        });
      },
      error: () => {
        this.settingPrimary.set(false);
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Could not set primary card.',
          life: 3000,
        });
      },
    });
  }
}
