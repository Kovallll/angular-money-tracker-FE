import { ChangeDetectionStrategy, Component, computed, HostBinding, inject } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { SubscribeCardItemComponent } from './card-item/subscribe-card-item.component';
import { SubscribtionsService } from '../../services/subscribtions.service';
import { SubscribtionsHttpService, RoutePaths } from '@/shared';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Carousel } from 'primeng/carousel';
import { DASHBOARD_CAROUSEL_RESPONSIVE } from '../../../slider/lib/carousel-options';

@Component({
  selector: 'dash-subscribe-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    Carousel,
    SubscribeCardItemComponent,
    ProgressSpinner,
  ],
  templateUrl: './subscribe-card.html',
  styleUrls: ['./subscribe-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSubscribeCardComponent {
  private readonly subscribtionsService = inject(SubscribtionsService);
  private readonly subscribeHttpService = inject(SubscribtionsHttpService);

  seeAllPath = RoutePaths.SUBSCRIPTIONS;
  isLoading = this.subscribeHttpService.isLoading;
  carouselResponsive = DASHBOARD_CAROUSEL_RESPONSIVE;
  pairsItems = computed(() => this.subscribtionsService.getPairsItems());

  /** Один слайд — нет стрелок, блок может быть уже */
  @HostBinding('class.carousel-single') get isCarouselSingle(): boolean {
    return this.pairsItems().length <= 1;
  }
}
