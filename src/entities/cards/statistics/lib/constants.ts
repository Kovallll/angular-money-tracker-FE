import { ChartConfiguration } from 'chart.js';
import { ChartViews } from './enums';

export const chartViewChoices = [ChartViews.WEEK, ChartViews.MONTH, ChartViews.YEAR];

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
