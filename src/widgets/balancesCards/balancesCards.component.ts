import { Component } from '@angular/core';
import { BalanceCardComponent } from '@/entities/cards/balances/page/ui/balance.component';
import { BalanceAddCardButtonComponent } from '@/features/balance/add-card-button/add-card.component';

@Component({
  standalone: true,
  selector: 'balances-cards',
  templateUrl: './balancesCards.component.html',
  styleUrls: ['./balancesCards.component.scss'],
  imports: [BalanceCardComponent, BalanceAddCardButtonComponent],
})
export class BalansesCardsComponent {}
