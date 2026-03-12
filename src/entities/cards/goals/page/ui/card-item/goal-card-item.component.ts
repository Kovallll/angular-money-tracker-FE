import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { CardBodyComponent, DashboardCardComponent } from '@/entities/cards/card';
import { getGoalProgress } from '@/entities/cards/goals/services/goals.service';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'goal-card-item',
  standalone: true,
  host: {
    '[class.is-active]': 'isActive()',
    '[class.is-completed]': 'isCompleted()',
  },
  imports: [
    CommonModule,
    AppCurrencyPrimaryPipe,
    DashboardCardComponent,
    CardBodyComponent,
    AppIconComponent,
  ],
  templateUrl: './goal-card-item.component.html',
  styleUrls: ['./goal-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardItemComponent {
  goal = input.required<any>();
  isActive = input<boolean>(false);
  isCompleted = input<boolean>(false);

  getProgress = getGoalProgress;
}
