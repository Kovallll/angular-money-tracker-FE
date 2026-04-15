// adjust-card.component.ts
import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GoalAdjustDialogComponent } from './modal/modal.component';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { CommonModule } from '@angular/common';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { GoalItem } from '@/shared';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'goal-adjust-card-button',
  templateUrl: './adjust-card.component.html',
  styleUrls: ['./adjust-card.component.scss'],
  imports: [CommonModule, AppButtonComponent, AppIconComponent, TranslateModule],
})
export class GoalAdjustCardButtonComponent {
  private dialog = inject(MatDialog);
  private goalsService = inject(GoalsService);
  private currencyService = inject(CurrencyService);

  goal = input.required<GoalItem>();

  openDialog() {
    const g = this.goal();
    const goalWithCurrency = {
      ...g,
      currencyCode:
        (g as { currencyCode?: string }).currencyCode ?? this.currencyService.primaryCode(),
    };
    const dialogRef = this.dialog.open(GoalAdjustDialogComponent, {
      width: '600px',
      maxWidth: 'calc(100vw - 24px)',
      data: goalWithCurrency,
      panelClass: 'goal-adjust-dialog',
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
