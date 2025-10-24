import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatIconModule } from '@angular/material/icon';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SlideComponent } from '../../../slider/slide/slide';
import { GoalCardItemComponent } from './card-item/goal-card-item.component';
import { GoalsService } from '../../services/goals.service';
import { RoutePaths } from '@/shared';

@Component({
  selector: 'dash-goal-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatIconModule,
    SlideComponent,
    SliderCardComponent,
    GoalCardItemComponent,
  ],
  templateUrl: './goal-card.html',
  styleUrl: `./goal-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGoalCardComponent {
  seeAllPath = RoutePaths.GOALS;

  constructor(private readonly goalsService: GoalsService) {}

  goals = this.goalsService.getGoals(5);
}
