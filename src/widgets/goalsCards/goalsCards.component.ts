import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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

const GOAL_PAGE_SIZE_WIDE = 9;
const GOAL_PAGE_SIZE_TWO_COLUMNS = 8;

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
  private breakpointObserver = inject(BreakpointObserver);

  /** При ширине ≤1440px — 2 или 1 колонка, 8 целей на странице; иначе 9. */
  readonly isTwoColumnsOrLess = toSignal(
    this.breakpointObserver.observe('(max-width: 1440px)').pipe(map((s) => s.matches)),
    { initialValue: true },
  );

  /** Активные цели (прогресс < 100%) */
  protected activeGoals = this.goalsService.getActiveGoals();
  /** Выполненные цели (100%) */
  protected completedGoals = this.goalsService.getCompletedGoals();

  /** Свитчер: false = активные, true = выполненные */
  protected showCompleted = signal(false);

  protected goals = signal<GoalItem[]>([]);
  protected activeCard = signal<GoalItem | null>(null);
  isLoading = this.goalsService.isLoading;

  override pageSize = GOAL_PAGE_SIZE_TWO_COLUMNS;

  /** Для пагинации и URL sync — список зависит от свитчера */
  override allData = computed(() =>
    this.showCompleted() ? this.completedGoals() : this.activeGoals(),
  );

  totalTargetBudget = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.activeGoals().reduce(
      (sum, g) =>
        sum + this.exchangeRates.convert(g.targetBudget ?? 0, g.currencyCode ?? 'BYN', primary),
      0,
    );
  });

  totalGoalBudget = computed(() => {
    const primary = this.currencyService.primaryCode();
    return this.activeGoals().reduce(
      (sum, g) =>
        sum + this.exchangeRates.convert(g.goalBudget ?? 0, g.currencyCode ?? 'BYN', primary),
      0,
    );
  });

  constructor() {
    super();

    effect(() => {
      const narrow = this.isTwoColumnsOrLess();
      this.pageSize = narrow ? GOAL_PAGE_SIZE_TWO_COLUMNS : GOAL_PAGE_SIZE_WIDE;
      this.sync();
    });

    effect(() => {
      if (this.activeCard()) return;
      if (this.activeGoals().length) {
        this.activeCard.set(this.activeGoals()[0]);
      } else if (this.completedGoals().length) {
        this.activeCard.set(this.completedGoals()[0]);
      }
    });
  }

  handleActiveCardChange(id: number | string) {
    const card = this.goalsService.getGoal(id);
    if (card()) this.activeCard.set(card()!);
  }

  handleGoalClick(goal: GoalItem) {
    this.handleActiveCardChange(goal.id);
  }

  setShowActive() {
    this.showCompleted.set(false);
  }

  setShowCompleted() {
    this.showCompleted.set(true);
  }

  setUpdatedData(updatedData: GoalItem[]): void {
    this.goals.set(updatedData);
    if (!this.showCompleted()) {
      this.activeCard.set(updatedData[0] ?? null);
    }
  }
}
