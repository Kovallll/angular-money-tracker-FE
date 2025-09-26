import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseItem, RoutePaths } from '@/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'expense-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './expense-card-item.component.html',
  styleUrls: ['./expense-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardItemComponent {
  router = inject(Router);
  @Input({ required: true }) expense!: ExpenseItem;

  handleCheckDetails() {
    this.router.navigate([RoutePaths.EXPENSES_DETAILS, this.expense.category.id]);
  }
}
