import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { MatIconModule } from '@angular/material/icon';
import { SliderCardComponent } from '../../../slider/slider-card';
import { SlideComponent } from '../../../slider/slide/slide';
import { GoalCardItemComponent } from './card-item/goal-card-item.component';

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
  title = 'Goals';
  items = [
    {
      id: 0,
      targetBudget: 12.5,
      goalBudget: 20.0,
      startDate: '01.01.2023',
      endDate: '01.01.2024',
    },
    {
      id: 1,
      targetBudget: 22.1,
      goalBudget: 42.4,
      startDate: '01.01.2024',
      endDate: '02.01.2024',
    },
    {
      id: 2,
      targetBudget: 1.25,
      goalBudget: 2.0,
      startDate: '11.03.2024',
      endDate: '11.04.2025',
    },
  ];

  labels = ['Target', 'Goal'];

  getDataset(item: any) {
    const datasets = [
      {
        backgroundColor: ['#3b82f6', '#ef4444'],
        hoverOffset: 4,
        data: [item.targetBudget, item.goalBudget - item.targetBudget],
      },
    ];

    return datasets;
  }
}
