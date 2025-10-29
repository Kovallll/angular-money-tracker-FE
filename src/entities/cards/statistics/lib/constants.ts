import { ChartConfiguration } from 'chart.js';
import { ChartViews } from './enums';
import { SelectOption } from '@/entities/select/lib';
import { formatCurrency, formatDate, formatNumber } from '@angular/common';

export const chartViewChoices: SelectOption<`${ChartViews}`>[] = [
  { label: ChartViews.WEEK, value: ChartViews.WEEK, id: 1 },
  { label: ChartViews.MONTH, value: ChartViews.MONTH, id: 2 },
  { label: ChartViews.YEAR, value: ChartViews.YEAR, id: 3 },
];

export const budgetChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      titleFont: { size: 30 },
      bodyFont: { size: 20 },
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0, 'en', '$')}`,
      },
    },
    legend: {
      display: true,
      position: 'top',
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'white' },
    },
    x: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'white' },
    },
  },
};

export const expensesOptions: ChartConfiguration<'bar'>['options'] = {
  indexAxis: 'y',
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    tooltip: {
      titleFont: { size: 30 },
      bodyFont: { size: 20 },
      callbacks: {
        label: (ctx) => `${formatCurrency(ctx.parsed.x ?? 0, 'en', '$')}`,
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      stacked: false,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { callback: (v) => formatCurrency(Number(v), 'en', '$'), color: 'white' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'white' },
    },
  },
};

export const goalsOptions: ChartConfiguration<'scatter'>['options'] = {
  maintainAspectRatio: false,
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { callback: (v) => formatCurrency(Number(v), 'en', '$'), color: 'white' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'white' },
    },
  },
  plugins: {
    tooltip: {
      titleFont: { size: 30 },
      bodyFont: { size: 20 },
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label}: days left: ${formatNumber(ctx.parsed.y ?? 0, 'en')}, budget left: ${formatCurrency(ctx.parsed.x ?? 0, 'en', '$')}`,
      },
    },
    legend: {
      display: false,
    },
  },
};
