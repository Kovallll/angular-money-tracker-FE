import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardHeaderComponent, CardBodyComponent } from '../card';
import { CommonModule } from '@angular/common';
import { SliderCardComponent } from '../slider/slider-card';
import { SlideComponent } from '../slider/slide/slide';

@Component({
  selector: 'balance-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CommonModule,
    SliderCardComponent,
    SlideComponent,
  ],
  templateUrl: './balance-card.html',
  styleUrl: `./balance-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceCardComponent {
  title = 'Total Balance';
  items = [
    {
      id: 0,
      cardName: 'Master Card',
      cardNumber: '**** **** **** 4328',
      cardBalance: 25.999,
    },
    {
      id: 1,
      cardName: 'Master Card',
      cardNumber: '**** **** **** 4466',
      cardBalance: 65.123,
    },
    {
      id: 2,
      cardName: 'Master Card',
      cardNumber: '**** **** **** 5555',
      cardBalance: 1.123,
    },
  ];

  totalBalance = this.items.reduce((acc, cur) => (acc += cur.cardBalance), 0);
}
