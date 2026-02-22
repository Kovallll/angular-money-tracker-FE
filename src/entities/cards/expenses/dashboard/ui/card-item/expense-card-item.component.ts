import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseItem } from '@/shared';

@Component({
  selector: 'expense-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, AppCurrencyPipe],
  templateUrl: './expense-card-item.component.html',
  styleUrls: ['./expense-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardItemComponent {
  expense = input.required<ExpenseItem>();
}
