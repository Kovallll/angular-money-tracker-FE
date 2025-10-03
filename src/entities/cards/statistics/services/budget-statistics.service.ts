import { generateTransactions, TransactionType } from '@/shared';
import { Injectable } from '@angular/core';
import { ChartViews } from '../lib';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

@Injectable({
  providedIn: 'root',
})
export class BudgetStatisticsService {
  private transactions = generateTransactions();

  private filterByRange(start: dayjs.Dayjs, end: dayjs.Dayjs) {
    return this.transactions.filter((t) => dayjs(t.date).isBetween(start, end, null, '[]'));
  }

  private aggregateByLabels(labels: string[], start: dayjs.Dayjs, unit: 'day' | 'month') {
    const revenue = Array(labels.length).fill(0);
    const expenses = Array(labels.length).fill(0);

    this.transactions.forEach((t) => {
      const date = dayjs(t.date);
      if (!date.isBetween(start, start.add(labels.length - 1, unit), unit, '[]')) return;

      const index = unit === 'day' ? date.diff(start, 'day') : date.diff(start, 'month');

      if (index >= 0 && index < labels.length) {
        if (t.type === TransactionType.Revenue) {
          revenue[index] += t.amount;
        } else {
          expenses[index] += t.amount;
        }
      }
    });

    return { revenue, expenses };
  }

  getWeekTransactionsData(offset: number) {
    const start = dayjs().startOf('week').add(offset, 'week');
    const end = start.endOf('week');

    const labels = Array.from({ length: 7 }).map((_, i) => start.add(i, 'day').format('ddd DD'));

    const { revenue, expenses } = this.aggregateByLabels(labels, start, 'day');

    return {
      labels,
      revenue,
      expenses,
      raw: this.filterByRange(start, end),
    };
  }

  getMonthTransactionsData(offset: number) {
    const start = dayjs().startOf('month').add(offset, 'month');
    const end = start.endOf('month');

    const daysInMonth = start.daysInMonth();
    const labels = Array.from({ length: daysInMonth }).map((_, i) =>
      start.add(i, 'day').format('DD.MM'),
    );

    const { revenue, expenses } = this.aggregateByLabels(labels, start, 'day');

    return {
      labels,
      revenue,
      expenses,
      raw: this.filterByRange(start, end),
    };
  }

  getYearTransactionsData(offset: number) {
    const start = dayjs().startOf('year').add(offset, 'year');
    const end = start.endOf('year');

    const labels = Array.from({ length: 12 }).map((_, i) => start.month(i).format('MMM YYYY'));

    const { revenue, expenses } = this.aggregateByLabels(labels, start, 'month');

    return {
      labels,
      revenue,
      expenses,
      raw: this.filterByRange(start, end),
    };
  }

  getPeriodTransactionsData(view: `${ChartViews}`, offset: number = 0) {
    if (view === ChartViews.WEEK) {
      return this.getWeekTransactionsData(offset);
    }
    if (view === ChartViews.MONTH) {
      return this.getMonthTransactionsData(offset);
    }
    if (view === ChartViews.YEAR) {
      return this.getYearTransactionsData(offset);
    }
    return { labels: [], revenue: [], expenses: [], raw: [] };
  }
}
