import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CardBodyComponent, DashboardCardComponent } from '@/entities/cards/card';
import { GoalAdjustCardButtonComponent } from '@/features/goal/adjust-goal-card/adjust-card.component';

@Component({
  selector: 'goal-card-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AppCurrencyPipe,

    DashboardCardComponent,
    CardBodyComponent,
    GoalAdjustCardButtonComponent,
  ],
  templateUrl: './goal-card-item.component.html',
  styleUrls: ['./goal-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardItemComponent {
  goal = input.required<any>();
}
