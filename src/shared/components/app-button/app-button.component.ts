import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AppButtonAppearance = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-button.component.html',
  styleUrl: './app-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  /** primary (accent), secondary, outline, ghost, danger */
  appearance = input<AppButtonAppearance>('primary');

  /** sm, md, lg — базовые размеры по умолчанию */
  size = input<AppButtonSize>('md');

  /** button | submit */
  type = input<'button' | 'submit'>('button');

  fullWidth = input<boolean>(false);

  disabled = input<boolean>(false);

  loading = input<boolean>(false);

  /** Дополнительный CSS класс */
  customClass = input<string>('');

  /** aria-label для доступности */
  ariaLabel = input<string>('');

  @Output() buttonClick = new EventEmitter<Event>();

  onClick(e: Event) {
    if (this.disabled() || this.loading()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.buttonClick.emit(e);
  }
}
