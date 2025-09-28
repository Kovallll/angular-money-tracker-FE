import { ChangeDetectionStrategy, Component, computed, Input } from '@angular/core';
import { CategoryItem } from '@/shared';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { ExpenseCardItemComponent } from '../card-item/expense-card-item.component';

@Component({
  selector: 'expense-card',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, ExpenseCardItemComponent],
  templateUrl: './expense-card.component.html',
  styleUrls: ['./expense-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardPageComponent {
  @Input({ required: true }) category: CategoryItem | null = null;

  expenses = computed(() => this.category?.expenses.slice(0, 2) ?? []);
}
