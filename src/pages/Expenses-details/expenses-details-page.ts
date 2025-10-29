import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CategoriesHttpService,
  CategoryItem,
  ExpenseItem,
  ExpensesHttpService,
  UrlSyncedComponent,
} from '@/shared';
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
  private expensesHttpService = inject(ExpensesHttpService);
  private categoriesHttpService = inject(CategoriesHttpService);

  expenses = signal<ExpenseItem[]>([]);
  category = signal<CategoryItem | null>(null);

  allData = computed(() => this.expensesHttpService.expenses() || []);

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
        this.categoriesHttpService.selectedCategoryId.set(categoryId);
        const category = this.categoriesHttpService.currentCategory();
        this.category.set(category || null);
      }
    });
  }
}
