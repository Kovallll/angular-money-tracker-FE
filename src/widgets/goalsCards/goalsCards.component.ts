import { Component } from '@angular/core';
import { GoalActiveCardComponent } from '@/entities/cards/goals/page/ui/active-card/active-card.component';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { GoalCardItemComponent } from '@/entities/cards/goals/page/ui/card-item/goal-card-item.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';

@Component({
  standalone: true,
  selector: 'goals-cards',
  templateUrl: './goalsCards.component.html',
  styleUrls: ['./goalsCards.component.scss'],
  imports: [GoalActiveCardComponent, GoalCardItemComponent, GoalsStatisticCardComponent],
})
export class GoalsCardsComponent {
  protected readonly goals = this.goalsService.getGoals();
  protected activeCard = this.goals[0];
  constructor(private readonly goalsService: GoalsService) {}

  handleActiveCardChange(id: number) {
    const card = this.goalsService.getGoal(id);
    if (card) this.activeCard = card;
  }
}
