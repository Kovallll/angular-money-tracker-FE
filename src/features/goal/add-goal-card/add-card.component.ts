import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { GoalItem } from '@/shared/types';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  standalone: true,
  selector: 'goal-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
  ],
})
export class GoalAddCardButtonComponent {
  private goalsService = inject(GoalsService);
  visible = signal(false);

  newGoal: Partial<GoalItem> = {
    title: '',
    targetBudget: 0,
    goalBudget: 0,
    startDate: '',
    endDate: '',
  };

  constructor() {}

  openDialog() {
    this.visible.set(true);
  }

  closeDialog() {
    this.visible.set(false);
  }

  createGoal() {
    if (!this.newGoal.title) return;
    this.newGoal = {
      ...this.newGoal,
      startDate: new Date(this.newGoal.startDate as unknown as Date).toISOString().split('T')[0],
      endDate: new Date(this.newGoal.endDate as unknown as Date).toISOString().split('T')[0],
    };
    this.goalsService.createGoal(this.newGoal as GoalItem);
    this.closeDialog();
    this.newGoal = {
      title: '',
      targetBudget: 0,
      goalBudget: 0,
      startDate: '',
      endDate: '',
    };
  }
}
