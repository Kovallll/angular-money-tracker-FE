import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { SlideComponent } from '../../../slider/slide/slide';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SubscribeCardItemComponent } from './card-item/subscribe-card-item.component';

@Component({
  selector: 'dash-subscribe-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    SlideComponent,
    SliderCardComponent,
    SubscribeCardItemComponent,
  ],
  templateUrl: './subscribe-card.html',
  styleUrls: ['./subscribe-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSubscribeCardComponent {
  title = 'Upcoming Subscribes';

  items = [
    { id: 0, price: 500, subscribeDate: '01.01.2023', subscribeName: 'Figma', type: 'monthly' },
    {
      id: 1,
      price: 2301,
      subscribeDate: '03.11.2024',
      subscribeName: 'GorkiFlowers',
      type: 'yearly',
    },
    { id: 2, price: 112, subscribeDate: '03.02.2022', subscribeName: 'GitHub', type: 'monthly' },
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
}
