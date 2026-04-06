import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesHttpService } from '@/shared';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'transaction-card-item',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, MatIconModule, AppIconComponent],
  templateUrl: './transaction-card-item.component.html',
  styleUrls: ['./transaction-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCardItemComponent {
  private categoriesHttpService = inject(CategoriesHttpService);
  item = input.required<any>();

  categoryIcon = computed(() => {
    const i = this.item();
    if (i?.categoryIcon) return i.categoryIcon;
    const list = this.categoriesHttpService.categories();
    const c = list.find((x) => String(x.id) === String(i?.categoryId));
    return c?.icon ?? null;
  });
}
