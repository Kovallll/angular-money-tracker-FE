import { Component } from '@angular/core';
import { BalanceCardComponent } from '@/entities/cards/balances/page/ui/balance.component';
import { BalanceAddCardButtonComponent } from '@/features/balance/add-card-button/add-card.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'balances-cards',
  templateUrl: './balancesCards.component.html',
  styleUrls: ['./balancesCards.component.scss'],
  imports: [BalanceCardComponent, BalanceAddCardButtonComponent, TranslatePipe],
})
export class BalansesCardsComponent {}
