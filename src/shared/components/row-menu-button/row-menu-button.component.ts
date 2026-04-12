import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

/**
 * Кнопка «⋯» для строк таблиц и карточек (контекстное меню).
 * Стили по умолчанию — прозрачный фон; {@link appearance} `subtle` — как на карточках подписок.
 */
@Component({
  selector: 'app-row-menu-button',
  standalone: true,
  templateUrl: './row-menu-button.component.html',
  styleUrl: './row-menu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowMenuButtonComponent {
  /** Текст для aria-label. */
  ariaLabel = input.required<string>();

  /** `ghost` — полностью прозрачная; `subtle` — лёгкая подложка и hover. */
  appearance = input<'ghost' | 'subtle'>('ghost');

  disabled = input(false, { transform: booleanAttribute });

  /** Клик по кнопке (родитель обычно вызывает stopPropagation и открывает меню). */
  pressed = output<Event>();

  @HostBinding('class.row-menu-button--subtle')
  get subtleHostClass(): boolean {
    return this.appearance() === 'subtle';
  }

  onClick(ev: Event) {
    this.pressed.emit(ev);
  }
}
