import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '../../../card';
import { BaseChartDirective } from 'ng2-charts';
import { budgetChartOptions, chartViewChoices, ChartViews } from '../../lib';
import { MatSelectModule } from '@angular/material/select';
import { BudgetStatisticsService } from '../../services/budget-statistics.service';
import { MatIconModule } from '@angular/material/icon';
import { SelectComponent } from '@/entities/select/ui/select.component';
import { SelectOption } from '@/entities/select/lib';

@Component({
  selector: 'budget-statistic-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    BaseChartDirective,
    MatSelectModule,
    MatIconModule,
    SelectComponent,
  ],
  templateUrl: './budget-stats.component.html',
  styleUrl: `./budget-stats.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetStatisticCardComponent {
  isWithSeeAll = input(false);
  seeAllPath = input<string>('');
  fixedView = input<SelectOption<`${ChartViews}`>>();
  title = input<string>('Budget');
  chartViewChoices = signal<SelectOption<`${ChartViews}`>[]>(chartViewChoices);
  options = budgetChartOptions;

  offset = signal(0);

  currentView = linkedSignal(() => this.fixedView() || this.chartViewChoices()[0]);

  chartData = computed(() =>
    this.budgetStatisticsService.getPeriodTransactionsData(this.currentView().value, this.offset()),
  );

  data = computed(() => ({
    labels: this.chartData().labels,
    datasets: [
      {
        label: 'Expenses',
        data: this.chartData().expenses,
        backgroundColor: '#ef4444',
        borderWidth: 1,
      },
      {
        label: 'Revenue',
        data: this.chartData().revenue,
        backgroundColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  }));

  constructor(private readonly budgetStatisticsService: BudgetStatisticsService) {}

  handleOffsetChange(offset: number) {
    this.offset.update((prev) => prev + offset);
  }

  handleClickPrev() {
    this.handleOffsetChange(-1);
  }

  handleClickNext() {
    if (this.offset() === 0) return;
    this.handleOffsetChange(1);
  }

  onValueChange(newValue: string) {
    const newView = this.chartViewChoices().find((item) => item.value === newValue)!;
    this.currentView.set(newView);
    this.offset.set(0);
  }
}
