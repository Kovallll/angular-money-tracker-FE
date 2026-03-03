import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Reusable modal form field: label + control + error slot.
 * Use inside app-modal-form. Place the input/select/datepicker as content.
 */
@Component({
  selector: 'app-modal-field',
  standalone: true,
  templateUrl: './app-modal-field.component.html',
  styleUrls: ['./app-modal-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppModalFieldComponent {
  /** Field label */
  label = input<string>('');
  /** Input id for label association */
  inputId = input<string>('');
  /** Show required asterisk */
  required = input<boolean>(false);
  /** Full width (grid-column: 1 / -1) on desktop */
  fullWidth = input<boolean>(false);
}
