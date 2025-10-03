import { ChartConfiguration } from 'chart.js';
import { ChartViews } from './enums';
import { SelectOption } from '@/entities/select/lib';

export const chartViewChoices: SelectOption<`${ChartViews}`>[] = [
  { label: ChartViews.WEEK, value: ChartViews.WEEK, id: 1 },
  { label: ChartViews.MONTH, value: ChartViews.MONTH, id: 2 },
  { label: ChartViews.YEAR, value: ChartViews.YEAR, id: 3 },
];

export const budgetChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const expensesOptions: ChartConfiguration<'bar'>['options'] = {
  indexAxis: 'y',
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false,
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
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};
