import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  input,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, SeeAllNavigation } from '../../../card';
import { SubscribeCardItemComponent } from './card-item/subscribe-card-item.component';
import { SubscribtionsService } from '../../services/subscribtions.service';
import { SubscribtionsHttpService, RoutePaths, SubscribeItem } from '@/shared';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Carousel } from 'primeng/carousel';
import { DASHBOARD_CAROUSEL_RESPONSIVE } from '../../../slider/lib/carousel-options';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import dayjs from 'dayjs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

function getNextChargeDate(sub: SubscribeItem): dayjs.Dayjs {
  const d = dayjs(sub.lastCharge || sub.subscribeDate);
  const type = (sub.type || '').toLowerCase();
  if (type === 'onetime' || type === 'one-time') return d;
  if (type === 'daily') return d.add(1, 'day');
  if (type === 'monthly') return d.add(1, 'month');
  if (type === 'yearly' || type === 'annually') return d.add(1, 'year');
  return d.add(1, 'month');
}

function toPairsItems(list: SubscribeItem[]): SubscribeItem[][] {
  const sorted = [...list].sort((a, b) => getNextChargeDate(a).diff(getNextChargeDate(b)));
  const acc: SubscribeItem[][] = [];
  for (const cur of sorted) {
    const last = acc.at(-1);
    if (!last || last.length === 2) acc.push([cur]);
    else last.push(cur);
  }
  return acc;
}

@Component({
  selector: 'dash-subscribe-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    Carousel,
    SubscribeCardItemComponent,
    ProgressSpinner,
    AppIconComponent,
  ],
  templateUrl: './subscribe-card.html',
  styleUrls: ['./subscribe-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSubscribeCardComponent {
  private readonly subscribtionsService = inject(SubscribtionsService);
  private readonly subscribeHttpService = inject(SubscribtionsHttpService);

  groupRoomId = input<string | undefined>(undefined);

  readonly seeAllNavigation = computed((): SeeAllNavigation | null => {
    const rid = this.groupRoomId()?.trim();
    if (!rid) return null;
    return {
      commands: ['/', RoutePaths.ROOM_DETAILS, rid],
      queryParams: { tab: 'subscriptions' },
    };
  });

  seeAllPath = RoutePaths.SUBSCRIPTIONS;
  carouselResponsive = DASHBOARD_CAROUSEL_RESPONSIVE;

  roomSubsQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['subscriptions', 'room', rid] as const,
      queryFn: () => lastValueFrom(this.subscribeHttpService.fetchSubscriptionsForRoom(rid)),
      enabled: !!rid,
    };
  });

  readonly isLoading = computed(() =>
    this.groupRoomId()?.trim()
      ? this.roomSubsQuery.isPending()
      : this.subscribeHttpService.isLoading(),
  );

  pairsItems = computed(() => {
    if (this.groupRoomId()?.trim()) {
      return toPairsItems(this.roomSubsQuery.data() ?? []);
    }
    return this.subscribtionsService.getPairsItems();
  });

  @HostBinding('class.carousel-single') get isCarouselSingle(): boolean {
    return this.pairsItems().length <= 1;
  }
}
