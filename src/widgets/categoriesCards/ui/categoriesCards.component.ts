import { CategoryCardComponent } from '@/entities/cards/categories/page/ui/categories.component';
import { CategoriesHttpService, ExpensesOverviewDto, StatisticsHttpService } from '@/shared';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { GategoryAddButtonComponent } from '@/features/categories/add-button/add-card.component';
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'categories-cards',
  templateUrl: './categories-cards.component.html',
  styleUrls: ['./categories-cards.component.scss'],
  imports: [CategoryCardComponent, CurrencyPipe, BaseChartDirective, GategoryAddButtonComponent],
  standalone: true,
})
export class CategoriesCardsComponent implements OnInit {
  private categoriesHttpService = inject(CategoriesHttpService);
  private statisticsHttpService = inject(StatisticsHttpService);

  categories = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  charts = injectQuery(() => ({
    queryKey: ['charts'],
    queryFn: () => this.categoriesHttpService.getCategoryExpenseLineCharts(),
  }));

  getCurrentChart(id: number) {
    return this.charts.data()?.find((c) => c.categoryId === id);
  }

  overageDeltaCompare = computed(() =>
    this.categoriesHttpService.getOverageDeltaCompare(this.charts.data() ?? []),
  );

  topTransactions = computed(() =>
    this.categoriesHttpService.getTopTransactions(this.categories.data() ?? []),
  );

  totalExpenses = computed(() =>
    this.categoriesHttpService.getTotalExpenses(this.categories.data() ?? []),
  );

  pieData?: ChartConfiguration<'doughnut'>['data'];
  barData?: ChartConfiguration<'bar'>['data'];
  lineData?: ChartConfiguration<'line'>['data'];

  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { usePointStyle: true, color: 'white', font: { size: 16 } },
      },
      tooltip: {
        titleFont: { size: 30 },
        bodyFont: { size: 20 },
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed as number)}`,
        },
      },
    },
    cutout: '60%',
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, color: 'white', font: { size: 16 } },
      },
      tooltip: {
        titleFont: { size: 30 },
        bodyFont: { size: 20 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y as number)}`,
        },
      },
    },
    scales: {
      x: { stacked: false, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { callback: (v) => formatCurrency(Number(v)), color: 'white' },
      },
    },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        titleFont: { size: 30 },
        bodyFont: { size: 20 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    elements: { line: { borderWidth: 2 }, point: { radius: 2 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'white' } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { callback: (v) => formatCurrency(Number(v)), color: 'white' },
      },
    },
  };

  ngOnInit() {
    this.statisticsHttpService
      .getExpensesOverview({ monthsBar: 6, topK: 5, locale: 'en' })
      .subscribe((res: ExpensesOverviewDto) => {
        this.pieData = res.pie;
        this.barData = res.bar;
        this.lineData = res.line;
      });
  }
}

function formatCurrency(v: number) {
  // Подставь локаль/валюту из настроек пользователя
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}
