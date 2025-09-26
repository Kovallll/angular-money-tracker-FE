import { Component } from '@angular/core';
import { BalansesCardsComponent } from '@/widgets/balancesCards/balancesCards.component';

@Component({
  selector: 'balances-page',
  imports: [BalansesCardsComponent],
  templateUrl: './balances-page.html',
  styleUrl: `./balances-page.scss`,
})
export class BalancesPageComponent {}
