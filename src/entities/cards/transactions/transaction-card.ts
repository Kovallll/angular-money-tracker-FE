import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent, CardHeaderComponent } from '../card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RoutePaths } from '@/shared';
@Component({
  selector: 'transaction-card',
  standalone: true,
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
    CardHeaderComponent,
    MatTabsModule,
  ],
  templateUrl: './transaction-card.html',
  styleUrl: `./transaction-card.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCardComponent {
  tabFilter = signal('All');

  title = 'Recent Transaction';

  tabs = ['All', 'Expenses', 'Revenue'];

  seeAllPath = RoutePaths.TRANSACTIONS;

  items = [
    {
      id: 0,
      title: 'GTR 5',
      category: 'Auto',
      cost: 1000,
      date: '01.01.2024',
      type: 'Expenses',
    },
    {
      id: 1,
      title: 'Polo Shirt',
      category: 'Clothes',
      cost: 546,
      date: '12.06.2023',
      type: 'Expenses',
    },
    {
      id: 2,
      title: 'Taxi',
      category: 'Transport',
      cost: 123,
      date: '02.03.2024',
      type: 'Revenue',
    },
  ];

  currentItems = computed(() => {
    if (this.tabFilter() === 'All') {
      return this.items;
    }
    return this.items.filter((item) => item.type === this.tabFilter());
  });

  onSelectedIndexChange(index: number) {
    this.tabFilter.set(this.tabs[index] ?? 'All');
  }
}
