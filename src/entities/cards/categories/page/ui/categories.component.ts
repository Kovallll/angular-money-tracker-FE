import { Component, computed, inject, input, ViewChild } from '@angular/core';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CategoriesHttpService, CategoryItem, CategoryLineChartDto } from '@/shared';
import { DividerComponent } from '@/shared/components/divider/divider';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditCategoryModalComponent } from '@/features/categories/edit-modal/modal/edit-card-modal.component';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CurrencyService } from '@/shared/services/currency/currency.service';

@Component({
  selector: 'category-card',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [
    AppCurrencyPipe,
    BaseChartDirective,
    DividerComponent,
    ContextMenuComponent,
    AppIconComponent,
  ],
  providers: [DialogService],
  standalone: true,
})
export class CategoryCardComponent {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;

  private categoriesHttpService = inject(CategoriesHttpService);
  private queryClient = inject(QueryClient);
  private currencyService = inject(CurrencyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  category = input<CategoryItem>({ title: '', totalExpenses: 0 } as CategoryItem);
  chart = input<CategoryLineChartDto>();
  ref: DynamicDialogRef | undefined | null;

  compareDelta = computed(() => this.categoriesHttpService.getChartDeltaCompare(this.chart()));
  constructor(public dialogService: DialogService) {}
  readonly options: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },

    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { size: 30 },
        bodyFont: { size: 20 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: { display: false },
    },
    elements: {
      line: { borderWidth: 1 },
      point: { radius: 1 },
    },
  };

  formatCurrency(v: number) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: this.currencyService.primaryCode(),
      maximumFractionDigits: 0,
    }).format(v);
  }

  handleDelete() {
    this.confirmationService.confirm({
      message: `Delete category «${this.category().title}»?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => this.doDeleteCategory(),
    });
  }

  private async doDeleteCategory() {
    try {
      await this.categoriesHttpService.deleteCategory(this.category().id);
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      this.queryClient.invalidateQueries({ queryKey: ['charts'] });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Category deleted',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete category',
        life: 3000,
      });
    }
  }

  handleEdit() {
    this.ref = this.dialogService.open(EditCategoryModalComponent, {
      header: 'Edit Category',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: this.category(),
    });
  }

  openContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.ctxMenu.open(event);
  }
}
