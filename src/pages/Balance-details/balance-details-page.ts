import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardDetailsComponent } from '@/entities/cards/balances/card-details/card-details.component';
import { TransactionsHistoryComponent } from '@/entities/cards/transactions/transactions-history/ui/transactions-history.component';
import { BalancesHttpService } from '@/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

@Component({
  selector: 'balance-details-page',
  imports: [CardDetailsComponent, TransactionsHistoryComponent],
  templateUrl: './balance-details-page.html',
  styleUrl: `./balance-details-page.scss`,
  standalone: true,
})
export class BalanceDetailsPageComponent {
  private route = inject(ActivatedRoute);
  private balancesHttpService = inject(BalancesHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  card = toSignal(this.balancesHttpService.getCard(this.id), { initialValue: null });

  transactions = computed(() => this.card()?.transactions ?? []);

  /** Transactions with amount converted to primary (reactive to header). */
  transactionsInPrimary = computed(() => {
    const list = this.transactions();
    const primary = this.currencyService.primaryCode();
    return list.map((t) => ({
      ...t,
      amount: this.exchangeRates.convert(t.amount, t.currencyCode ?? 'BYN', primary),
    }));
  });
}
