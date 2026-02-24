import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { ExpenseItem, RoutePaths } from '@/shared';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'expense-card-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, AppCurrencyPipe, AppIconComponent],
  templateUrl: './expense-card-item.component.html',
  styleUrls: ['./expense-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardItemComponent {
  private router = inject(Router);
  expense = input.required<ExpenseItem>();

  goToDetails() {
    const exp = this.expense();
    const categoryId = exp?.category?.id;
    if (categoryId != null) {
      this.router.navigate([RoutePaths.EXPENSES_DETAILS, categoryId], {
        state: { from: this.router.url },
      });
    }
  }
}
