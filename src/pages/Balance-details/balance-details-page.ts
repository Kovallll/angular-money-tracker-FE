import { cards } from '@/shared/constants';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardDetailsComponent } from '@/entities/cards/balances/card-details/card-details.component';
import { TransactionsHistoryComponent } from '@/entities/cards/transactions/transactions-history/ui/transactions-history.component';

@Component({
  selector: 'balance-details-page',
  imports: [CardDetailsComponent, TransactionsHistoryComponent],
  templateUrl: './balance-details-page.html',
  styleUrl: `./balance-details-page.scss`,
  standalone: true,
})
export class BalanceDetailsPageComponent {
  private route = inject(ActivatedRoute);

  card = signal<(typeof cards)[number] | null>(null);

  transactions = computed(() => this.card()?.transactions ?? []);

  constructor() {
    const cardId = this.route.snapshot.paramMap.get('id');
    if (cardId) {
      this.card.set(cards.find((item) => item.id === Number(cardId)) ?? null);
    }
  }
}
