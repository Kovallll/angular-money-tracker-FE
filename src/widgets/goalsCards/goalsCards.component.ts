import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { GoalActiveCardComponent } from '@/entities/cards/goals/page/ui/active-card/active-card.component';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { GoalCardItemComponent } from '@/entities/cards/goals/page/ui/card-item/goal-card-item.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { GoalItem, UrlSyncedComponent } from '@/shared';
import { GoalAddCardButtonComponent } from '@/features/goal/add-goal-card/add-card.component';

@Component({
  standalone: true,
  selector: 'goals-cards',
  templateUrl: './goalsCards.component.html',
  styleUrls: ['./goalsCards.component.scss'],
  imports: [
    GoalActiveCardComponent,
    GoalCardItemComponent,
    GoalsStatisticCardComponent,
    PaginationComponent,
    GoalAddCardButtonComponent,
  ],
})
export class GoalsCardsComponent extends UrlSyncedComponent<GoalItem> {
  protected readonly goalsService = inject(GoalsService);
  protected allGoals = this.goalsService.getGoals();
  protected goals = linkedSignal(this.allGoals);
  protected activeCard = signal<GoalItem | null>(null);

  allData = computed(() => this.allGoals());

  constructor() {
    super();
    this.initPageSize(18);

    effect(() => {
      if (!this.activeCard() && this.goals()) {
        this.activeCard.set(this.goals()[0]);
      }
    });
  }

  handleActiveCardChange(id: number) {
    const card = this.goalsService.getGoal(id);
    if (card()) this.activeCard.set(card()!);
  }

  setUpdatedData(updatedData: GoalItem[]): void {
    this.goals.set(updatedData);
    this.activeCard.set(updatedData[0] ?? null);
  }
}
