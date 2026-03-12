import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

/**
 * Shared modal content shell. Use for consistent modal styling across the app.
 * Wraps content with rounded corners, border, background.
 *
 * Use with DynamicDialog (PrimeNG) or MatDialog — the shell provides the inner content area.
 * All modals should use class="app-modal-form" on forms and .field / .form-field for inputs.
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [AppButtonComponent, AppIconComponent],
  templateUrl: './app-modal-shell.component.html',
  styleUrls: ['./app-modal-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppModalShellComponent {
  /** Modal title (e.g. "Edit Goal", "Add Category"). Omit when using DynamicDialog header. */
  title = input<string>('');
  /** Show close (×) button in header. */
  showCloseButton = input<boolean>(true);
  /** Emitted when close button is clicked. */
  closeRequest = output<void>();

  /** Show Delete button (danger). */
  showDelete = input<boolean>(false);
  /** Show Cancel button (secondary). */
  showCancel = input<boolean>(false);
  /** Show Save/Primary button. */
  showSave = input<boolean>(false);
  /** Label for Delete button. */
  deleteLabel = input<string>('Delete');
  /** Label for Cancel button. */
  cancelLabel = input<string>('Cancel');
  /** Label for Save button. */
  saveLabel = input<string>('Save');
  /** Primary/Save button disabled (e.g. form invalid). */
  saveDisabled = input<boolean>(false);
  /** Primary/Save button loading state (e.g. during API call). */
  saveLoading = input<boolean>(false);

  /**
   * When true, shell has no border/radius — used inside DynamicDialog or p-dialog
   * where the outer dialog already provides the frame. Prevents double-border.
   */
  embedded = input<boolean>(false);

  /** Emitted when Delete is clicked. */
  deleteRequest = output<void>();
  /** Emitted when Cancel is clicked. */
  cancelRequest = output<void>();
  /** Emitted when Save is clicked. */
  saveRequest = output<void>();

  hasActions = computed(() => this.showDelete() || this.showCancel() || this.showSave());
}
