import { Component, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BudgetStatisticCardComponent } from '@/entities/cards/statistics/ui/budget/budget-stats.component';
import { ExpensesStatisticCardComponent } from '@/entities/cards/statistics/ui/expenses/expenses-stats.component';
import { GoalsStatisticCardComponent } from '@/entities/cards/statistics/ui/goals/goals-stats.component';
import { CategoryAnaliticsComponent } from '@/widgets/categoryAnalitics/ui/analitics.component';
import { SavedReportsComponent } from '@/widgets/savedReports/saved-reports.component';
import { StatisticsTabCoordinatorService } from '@/shared';

@Component({
  selector: 'app-statistics-page',
  imports: [
    BudgetStatisticCardComponent,
    ExpensesStatisticCardComponent,
    GoalsStatisticCardComponent,
    CategoryAnaliticsComponent,
    SavedReportsComponent,
  ],
  templateUrl: './statistics-page.html',
  styleUrl: `./statistics-page.scss`,
})
export class StatisticsPageComponent implements OnDestroy {
  private tabCoordinator = inject(StatisticsTabCoordinatorService);

  readonly statsView = signal<'charts' | 'reports'>('charts');

  constructor() {
    this.tabCoordinator.setCurrentView(this.statsView());

    this.tabCoordinator.switchToCharts$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.statsView.set('charts');
      this.tabCoordinator.setCurrentView('charts');
    });
    this.tabCoordinator.switchToReports$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.statsView.set('reports');
      this.tabCoordinator.setCurrentView('reports');
    });
  }

  setStatsView(view: 'charts' | 'reports') {
    this.statsView.set(view);
    this.tabCoordinator.setCurrentView(view);
  }

  ngOnDestroy(): void {
    this.tabCoordinator.resetView();
  }
}
