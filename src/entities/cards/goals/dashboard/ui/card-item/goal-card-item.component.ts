import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { DividerComponent } from '@/shared/components/divider/divider';

@Component({
  selector: 'goal-card-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AppCurrencyPipe,
    DatePipe,
    BaseChartDirective,
    DividerComponent,
  ],
  templateUrl: './goal-card-item.component.html',
  styleUrls: ['./goal-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardItemComponent {
  item = input.required<any>();
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
