import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { GoalActiveCardComponent } from '@/entities/cards/goals/page/ui/active-card/active-card.component';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { GoalCardItemComponent } from '@/entities/cards/goals/page/ui/card-item/goal-card-item.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { GoalItem, UrlSyncedComponent } from '@/shared';
import { GoalAddCardButtonComponent } from '@/features/goal/add-goal-card/add-card.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';

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
    ProgressSpinnerModule,
    AppCurrencyPipe,
  ],
})
export class GoalsCardsComponent extends UrlSyncedComponent<GoalItem> {
  protected readonly goalsService = inject(GoalsService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  protected allGoals = this.goalsService.getGoals();
  protected goals = linkedSignal(this.allGoals);
  protected activeCard = signal<GoalItem | null>(null);
  isLoading = this.goalsService.isLoading;
  allData = computed(() => this.allGoals());

  totalTargetBudget = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.goals().reduce(
      (sum, g) =>
        sum + this.exchangeRates.convert(g.targetBudget ?? 0, g.currencyCode ?? 'BYN', primary),
      0,
    );
  });

  totalGoalBudget = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.goals().reduce(
      (sum, g) =>
        sum + this.exchangeRates.convert(g.goalBudget ?? 0, g.currencyCode ?? 'BYN', primary),
      0,
    );
  });

  constructor() {
    super();
    this.initPageSize(9);

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
