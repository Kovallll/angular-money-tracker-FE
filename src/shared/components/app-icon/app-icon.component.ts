import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { getCategoryIconName } from '@/shared/constants/category-icons';

/**
 * Единый компонент для отображения иконок в приложении.
 * Использует Material Icons; имя иконки задаётся через input (как в БД для категорий).
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [MatIconModule],
  template: ` <mat-icon [fontIcon]="iconName()" [class]="iconClass()"></mat-icon> `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      mat-icon {
        font-size: inherit;
        width: inherit;
        height: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIconComponent {
  /** Имя иконки (Material Icons), например directions_car, school. */
  icon = input<string | null | undefined>('');

  /** Дополнительные CSS-классы для mat-icon. */
  iconClass = input<string>('');

  iconName = () => getCategoryIconName(this.icon());
}
