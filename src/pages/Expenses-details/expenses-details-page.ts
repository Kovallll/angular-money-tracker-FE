import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryItem, ExpenseItem, UrlSyncService } from '@/shared';
import { ExpensesService } from '@/widgets/expensesCards/services/expenses.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'expenses-details-page',
  imports: [TableComponent, DashboardCardComponent, CardBodyComponent, ControlsComponent],
  templateUrl: './expenses-details-page.html',
  styleUrl: `./expenses-details-page.scss`,
  standalone: true,
})
export class ExpensesDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private expensesService = inject(ExpensesService);
  private urlSyncService = inject(UrlSyncService);

  expenses = signal<ExpenseItem[]>([]);
  category = signal<CategoryItem | null>(null);

  filterData = computed(() => this.category()?.expenses || []);

  get isEmpty() {
    return this.expenses().length === 0;
  }

  displayedCells = signal([
    { field: 'date', name: 'Date' },
    { field: 'title', name: 'Title' },
    { field: 'amount', name: 'Amount' },
  ]);

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.filterData(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'Search by title' },
  }));

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(
      ([routeParams, queryParams]) => {
        if (!this.category()) {
          const categoryId = routeParams['id'];

          if (!categoryId) return;

          const category = this.expensesService.getCurrentCategory(+categoryId);
          this.category.set(category || null);
        }
        if (this.category()) {
          this.category.set(this.category());
          const expenses = this.urlSyncService.getSyncData(
            this.category()?.expenses || [],
            queryParams,
          );
          this.expenses.set(expenses);
        }
      },
    );
  }
}
