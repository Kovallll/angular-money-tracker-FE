import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  input,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, SeeAllNavigation } from '../../../card';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { GoalCardItemComponent } from './card-item/goal-card-item.component';
import { getGoalProgress, GoalsService } from '../../services/goals.service';
import { GoalsHttpService } from '@/shared/services/models';
import { RoutePaths } from '@/shared';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Carousel } from 'primeng/carousel';
import { DASHBOARD_CAROUSEL_RESPONSIVE } from '../../../slider/lib/carousel-options';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'dash-goal-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    AppIconComponent,
    Carousel,
    GoalCardItemComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './goal-card.html',
  styleUrl: `./goal-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGoalCardComponent {
  private readonly goalsService = inject(GoalsService);
  private readonly goalsHttp = inject(GoalsHttpService);

  groupRoomId = input<string | undefined>(undefined);

  readonly seeAllNavigation = computed((): SeeAllNavigation | null => {
    const rid = this.groupRoomId()?.trim();
    if (!rid) return null;
    return {
      commands: ['/', RoutePaths.ROOM_DETAILS, rid],
      queryParams: { tab: 'goals' },
    };
  });

  seeAllPath = RoutePaths.GOALS;
  carouselResponsive = DASHBOARD_CAROUSEL_RESPONSIVE;

  roomGoalsQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['goals', 'room', rid] as const,
      queryFn: () => lastValueFrom(this.goalsHttp.fetchGoalsForRoom(rid)),
      enabled: !!rid,
    };
  });

  readonly isLoading = computed(() =>
    this.groupRoomId()?.trim() ? this.roomGoalsQuery.isPending() : this.goalsService.isLoading(),
  );

  readonly goals = computed(() => {
    if (this.groupRoomId()?.trim()) {
      const list = this.roomGoalsQuery.data() ?? [];
      const active = list.filter((g) => getGoalProgress(g) < 100);
      const sorted = [...active].sort((a, b) => {
        const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return tb - ta;
      });
      return sorted.slice(0, 5);
    }
    return this.goalsService.getGoals(5)();
  });

  @HostBinding('class.carousel-single') get isCarouselSingle(): boolean {
    return this.goals().length <= 1;
  }
}
