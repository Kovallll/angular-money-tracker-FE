import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { DashboardCard, CardBody } from '../card';
import { MatIconModule } from '@angular/material/icon';
import { SliderCard } from '../slider/slider-card';
import { Slide } from '../slider/slide/slide';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DividerComponent } from '@/shared/components/divider/divider';

@Component({
  selector: 'subscribe-card',
  standalone: true,
  imports: [
    DashboardCard,
    CardBody,
    MatIconModule,
    Slide,
    SliderCard,
    CurrencyPipe,
    DatePipe,
    DividerComponent,
  ],
  templateUrl: './subscribe-card.html',
  styleUrl: `./subscribe-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCardComponent implements OnInit {
  title = 'Upcoming Subscribes';

  items = [
    {
      id: 0,
      price: 500,
      subscribeDate: '01.01.2023',
      subscribeName: 'Figma',
      type: 'monthly',
    },
    {
      id: 1,
      price: 2301,
      subscribeDate: '03.11.2024',
      subscribeName: 'GorkiFlowers',
      type: 'yearly',
    },
    {
      id: 2,
      price: 112,
      subscribeDate: '03.02.2022',
      subscribeName: 'GitHub',
      type: 'monthly',
    },
  ];
  pairsItems = this.items.reduce((acc: any[][], cur) => {
    const last = acc.at(-1);

    if (!last || last.length === 2) {
      acc.push([cur]);
    } else {
      last.push(cur);
    }

    return acc;
  }, []);
  ngOnInit() {
    console.log(this.pairsItems);
  }
}
