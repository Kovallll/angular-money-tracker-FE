// adjust-card.component.ts
import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GoalAdjustDialogComponent } from './modal/modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { GoalItem } from '@/shared';

@Component({
  standalone: true,
  selector: 'goal-adjust-card-button',
  templateUrl: './adjust-card.component.html',
  styleUrls: ['./adjust-card.component.scss'],
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class GoalAdjustCardButtonComponent {
  private dialog = inject(MatDialog);
  private goalsService = inject(GoalsService);

  goal = input.required<GoalItem>();

  openDialog() {
    const dialogRef = this.dialog.open(GoalAdjustDialogComponent, {
      width: '600px',
      data: { ...this.goal() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.delete) {
        this.goalsService.deleteGoal(this.goal().id);
      } else if (result) {
        this.goalsService.updateGoal(this.goal().id, result);
      }
    });
  }
}
