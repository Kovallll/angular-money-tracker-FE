import { Component, computed, effect, inject, input } from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CategoriesHttpService, CategoryItem, CategoryLineChartDto } from '@/shared';
import { DividerComponent } from '@/shared/components/divider/divider';

@Component({
  selector: 'category-card',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [CurrencyPipe, BaseChartDirective, DividerComponent],
  standalone: true,
})
export class CategoryCardComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  category = input<CategoryItem>({ title: '', totalExpenses: 0 } as CategoryItem);
  chart = input<CategoryLineChartDto>();

  constructor() {
    effect(() => {
      console.log(this.compareDelta(), 'compareDelta');
    });
  }

  compareDelta = computed(() => this.categoriesHttpService.getChartDeltaCompare(this.chart()));

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
}
