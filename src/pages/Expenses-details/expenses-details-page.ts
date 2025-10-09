import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryItem, ExpenseItem, UrlSyncedComponent } from '@/shared';
import { ExpensesService } from '@/widgets/expensesCards/services/expenses.service';
import { TableComponent } from '@/entities/table/ui/table.component';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';

@Component({
  selector: 'expenses-details-page',
  imports: [
    TableComponent,
    DashboardCardComponent,
    CardBodyComponent,
    ControlsComponent,
    PaginationComponent,
  ],
  templateUrl: './expenses-details-page.html',
  styleUrl: `./expenses-details-page.scss`,
  standalone: true,
})
export class ExpensesDetailsPageComponent
  extends UrlSyncedComponent<ExpenseItem>
  implements OnInit
{
  private route = inject(ActivatedRoute);
  private expensesService = inject(ExpensesService);

  expenses = signal<ExpenseItem[]>([]);
  category = signal<CategoryItem | null>(null);

  allData = computed(() => this.category()?.expenses || []);

  override get isEmpty() {
    return this.expenses().length === 0;
  }

  constructor() {
    super();
    effect(() => {
      if (this.allData().length > 0) this.sync();
    });
  }

  displayedCells = signal([
    { field: 'date', name: 'Date' },
    { field: 'title', name: 'Title' },
    { field: 'amount', name: 'Amount' },
  ]);

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.allData(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps: { searchField: 'title', placeholder: 'Search by title' },
  }));

  setUpdatedData(updatedData: ExpenseItem[]): void {
    this.expenses.set(updatedData);
  }

  override ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!this.category()) {
        const categoryId = params['id'];

        if (!categoryId) return;

        const category = this.expensesService.getCurrentCategory(+categoryId);
        this.category.set(category || null);
      }
    });
  }
}
