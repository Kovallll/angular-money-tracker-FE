import { Component, computed, inject, input, output, ViewChild } from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CategoriesHttpService, CategoryItem, CategoryLineChartDto } from '@/shared';
import { DividerComponent } from '@/shared/components/divider/divider';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditCategoryModalComponent } from '@/features/categories/edit-modal/modal/edit-card-modal.component';

@Component({
  selector: 'category-card',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [CurrencyPipe, BaseChartDirective, DividerComponent, ContextMenuComponent],
  providers: [DialogService],
  standalone: true,
})
export class CategoryCardComponent {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;

  private categoriesHttpService = inject(CategoriesHttpService);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(v);
  }

  async handleDelete() {
    const res = await this.categoriesHttpService.deleteCategory(this.category().id);
    if (res) {
      this.categoriesHttpService.loadCategories();
    }
  }

  handleEdit() {
    this.ref = this.dialogService.open(EditCategoryModalComponent, {
      header: 'Edit Transaction',
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
