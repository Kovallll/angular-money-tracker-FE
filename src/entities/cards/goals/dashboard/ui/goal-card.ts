import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatIconModule } from '@angular/material/icon';
import { GoalCardItemComponent } from './card-item/goal-card-item.component';
import { GoalsService } from '../../services/goals.service';
import { RoutePaths } from '@/shared';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Carousel } from 'primeng/carousel';
import { DASHBOARD_CAROUSEL_RESPONSIVE } from '../../../slider/lib/carousel-options';

@Component({
  selector: 'dash-goal-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatIconModule,
    Carousel,
    GoalCardItemComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './goal-card.html',
  styleUrl: `./goal-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGoalCardComponent {
  seeAllPath = RoutePaths.GOALS;
  isLoading = this.goalsService.isLoading;
  carouselResponsive = DASHBOARD_CAROUSEL_RESPONSIVE;
  constructor(private readonly goalsService: GoalsService) {}

  goals = this.goalsService.getGoals(5);

  /** Один слайд — нет стрелок, блок может быть уже */
  @HostBinding('class.carousel-single') get isCarouselSingle(): boolean {
    return this.goals().length <= 1;
  }
}
