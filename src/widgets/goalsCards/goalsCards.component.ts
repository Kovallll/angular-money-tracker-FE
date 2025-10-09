import { Component, inject, linkedSignal, signal } from '@angular/core';
import { GoalActiveCardComponent } from '@/entities/cards/goals/page/ui/active-card/active-card.component';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { GoalCardItemComponent } from '@/entities/cards/goals/page/ui/card-item/goal-card-item.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { GoalItem, UrlSyncedComponent } from '@/shared';

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
  ],
})
export class GoalsCardsComponent extends UrlSyncedComponent<GoalItem> {
  protected readonly goalsService = inject(GoalsService);
  protected goals = signal<GoalItem[]>([]);
  protected activeCard = linkedSignal(() => this.goals()[0]);

  allData = signal(this.goalsService.getGoals());

  constructor() {
    super();
    this.initPageSize(18);
  }

  handleActiveCardChange(id: number) {
    const card = this.goalsService.getGoal(id);
    if (card) this.activeCard.set(card);
  }

  setUpdatedData(updatedData: GoalItem[]): void {
    this.goals.set(updatedData);
    this.activeCard.set(updatedData[0] ?? null);
  }
}
