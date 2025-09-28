import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { SlideComponent } from '../../../slider/slide/slide';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SubscribeCardItemComponent } from './card-item/subscribe-card-item.component';
import { SubscribtionsService } from '../../services/subscribtions.service';
import { RoutePaths } from '@/shared';

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
  seeAllPath = RoutePaths.SUBSCRIPTIONS;

  pairsItems = this.subscribtionsService.getPairsItems();

  constructor(private readonly subscribtionsService: SubscribtionsService) {}
}
