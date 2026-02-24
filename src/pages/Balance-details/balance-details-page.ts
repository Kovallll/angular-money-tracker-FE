import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
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

  private routeId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null as string | null,
  });

  id = computed(() => {
    const v = this.routeId();
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  });

  /** Карта из общего списка — после редактирования refresh() обновляет список и данные здесь. */
  card = computed(() => {
    const id = this.id();
    if (id == null) return null;
    return this.balancesHttpService.cards().find((c) => c.id === id) ?? null;
  });

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
