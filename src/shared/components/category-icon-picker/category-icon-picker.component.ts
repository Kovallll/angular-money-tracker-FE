import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import {
  CATEGORY_ICON_OPTIONS,
  CategoryIconOption,
  DEFAULT_CATEGORY_ICON,
} from '@/shared/constants/category-icons';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'category-icon-picker',
  standalone: true,
  imports: [FormsModule, InputTextModule, AppIconComponent, TranslateModule],
  templateUrl: './category-icon-picker.component.html',
  styleUrl: './category-icon-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryIconPickerComponent {
  /** Имя Material Icon (хранится в БД). */
  selectedIcon = model<string>(DEFAULT_CATEGORY_ICON);

  searchQuery = signal('');

  /** Текущая иконка из БД может отсутствовать в списке — показываем её в сетке. */
  private readonly optionsWithFallback = computed((): CategoryIconOption[] => {
    const base = [...CATEGORY_ICON_OPTIONS];
    const sel = this.selectedIcon();
    if (sel && !base.some((o) => o.value === sel)) {
      base.unshift({ value: sel, label: this.humanizeIconValue(sel) });
    }
    return base;
  });

  readonly totalCount = computed(() => this.optionsWithFallback().length);

  readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.optionsWithFallback();
    if (!q) return list;
    return list.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  });

  /** Подпись выбранной иконки (под сеткой). */
  readonly selectedLabel = computed(() => {
    const sel = this.selectedIcon();
    const opt = this.optionsWithFallback().find((o) => o.value === sel);
    return opt?.label ?? this.humanizeIconValue(sel);
  });

  pick(value: string) {
    this.selectedIcon.set(value);
  }

  isActive(value: string): boolean {
    return this.selectedIcon() === value;
  }

  private humanizeIconValue(value: string): string {
    const t = value.replace(/_/g, ' ').trim();
    if (!t) return value;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
}
