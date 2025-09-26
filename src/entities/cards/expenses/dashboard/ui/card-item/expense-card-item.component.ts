import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseItem } from '@/shared';

@Component({
  selector: 'expense-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './expense-card-item.component.html',
  styleUrls: ['./expense-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardItemComponent {
  expense = input.required<ExpenseItem>();
}
