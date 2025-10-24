import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardDetailsComponent } from '@/entities/cards/balances/card-details/card-details.component';
import { TransactionsHistoryComponent } from '@/entities/cards/transactions/transactions-history/ui/transactions-history.component';
import { BalancesHttpService } from '@/shared';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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

  transactions = computed(() => this.card()?.transactions ?? []);
  id = Number(this.route.snapshot.paramMap.get('id'));
  card = toSignal(this.balancesHttpService.getCard(this.id), { initialValue: null });
}
