import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getCategoryIconName } from '@/shared/constants/category-icons';

/**
 * Единый компонент для отображения иконок в приложении.
 * Поддерживает:
 * - Material Icons (категории через `icon` + маппинг, или прямое имя через `material`)
 * - PrimeIcons (через `prime`)
 * - Emoji (через `emoji`)
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './app-icon.component.html',
  styleUrls: ['./app-icon.component.scss'],
  host: {
    '[style.--app-icon-size]': 'sizeVar()',
    '[style.--app-icon-color]': 'colorVar()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIconComponent {
  /** Имя иконки (Material Icons), например directions_car, school. */
  icon = input<string | null | undefined>('');

  /** Прямое имя Material Icons (без маппинга категорий). */
  material = input<string | null | undefined>(null);

  /** PrimeIcon имя: `wallet` / `pi-wallet` / `pi pi-wallet`. */
  prime = input<string | null | undefined>(null);

  /** Emoji-иконка (если задана — имеет приоритет). */
  emoji = input<string | null | undefined>(null);

  /** Размер в px (если не задан — наследуется от контекста). */
  sizePx = input<number | null | undefined>(null);

  /** Цвет (CSS-значение). По умолчанию наследуется (`currentColor`). */
  color = input<string | null | undefined>(null);

  /** Дополнительные CSS-классы для mat-icon. */
  iconClass = input<string>('');

  /** Если задан `ariaLabel`, иконка станет доступной скринридерам. */
  ariaLabel = input<string | null | undefined>(null);

  /** Декоративная иконка: по умолчанию скрыта от скринридеров. */
  decorative = input<boolean>(true);

  readonly mode = computed<'emoji' | 'prime' | 'material'>(() => {
    if (this.emoji()?.trim()) return 'emoji';
    if (this.prime()?.trim()) return 'prime';
    return 'material';
  });

  readonly materialName = computed(() => {
    const direct = this.material();
    if (direct?.trim()) return direct.trim();
    return getCategoryIconName(this.icon());
  });

  readonly primeClasses = computed(() => {
    const raw = (this.prime() ?? '').trim();
    if (!raw) return '';

    // Нормализуем к виду: "pi pi-xxx"
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    if (cleaned.startsWith('pi ')) return cleaned;
    if (cleaned.startsWith('pi-')) return `pi ${cleaned}`;
    if (cleaned.startsWith('pi')) return `pi ${cleaned}`;
    return `pi pi-${cleaned}`;
  });

  readonly ariaHidden = computed(() => {
    const label = this.ariaLabel();
    return this.decorative() && !(label && label.trim());
  });

  sizeVar(): string | null {
    const v = this.sizePx();
    return typeof v === 'number' && Number.isFinite(v) && v > 0 ? `${v}px` : null;
  }

  colorVar(): string | null {
    const c = this.color();
    return c && c.trim() ? c.trim() : null;
  }

  materialClassAttr(): string {
    const extra = this.iconClass()?.trim();
    return ['app-icon__material', extra].filter(Boolean).join(' ');
  }

  primeClassAttr(): string {
    const extra = this.iconClass()?.trim();
    const prime = this.primeClasses()?.trim();
    return ['app-icon__prime', prime, extra].filter(Boolean).join(' ');
  }

  emojiClassAttr(): string {
    const extra = this.iconClass()?.trim();
    return ['app-icon__emoji', extra].filter(Boolean).join(' ');
  }
}
