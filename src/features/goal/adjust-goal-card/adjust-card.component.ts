import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'goal-adjust-card-button',
  templateUrl: './adjust-card.component.html',
  styleUrls: ['./adjust-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
})
export class GoalAdjustCardButtonComponent {}
