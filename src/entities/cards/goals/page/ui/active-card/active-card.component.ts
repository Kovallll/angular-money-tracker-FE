import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { DividerComponent } from '@/shared/components/divider/divider';
import { CardBodyComponent, DashboardCardComponent } from '@/entities/cards/card';
import { GoalAdjustCardButtonComponent } from '@/features/goal/adjust-goal-card/adjust-card.component';

@Component({
  selector: 'goal-active-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
    BaseChartDirective,
    DividerComponent,
    DashboardCardComponent,
    CardBodyComponent,
    GoalAdjustCardButtonComponent,
  ],
  templateUrl: './active-card.component.html',
  styleUrls: ['./active-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalActiveCardComponent {
  goal = input<any>();
  labels = ['Target', 'Goal'];

  getDataset(item: any) {
    return [
      {
        backgroundColor: ['#3b82f6', '#ef4444'],
        hoverOffset: 4,
        data: [item.targetBudget, item.goalBudget - item.targetBudget],
      },
    ];
  }
}
