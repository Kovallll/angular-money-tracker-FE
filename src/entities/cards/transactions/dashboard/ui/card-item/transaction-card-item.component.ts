import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesHttpService } from '@/shared';

@Component({
  selector: 'transaction-card-item',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, MatIconModule],
  templateUrl: './transaction-card-item.component.html',
  styleUrls: ['./transaction-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCardItemComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  item = input.required<any>();

  categoryIcon = computed(() => {
    const i = this.item();
    const list = this.categoriesHttpService.categories();
    const c = list.find((x) => x.id === i?.categoryId);
    return c?.icon ?? null;
  });
}
