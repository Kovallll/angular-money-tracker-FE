import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { User, UserService } from '@/shared';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [FormsModule, InputTextModule, ButtonModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrl: './edit-profile-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileModalComponent {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  user = this.config.data as User;
  loading = signal(false);

  profile = {
    name: this.user?.name ?? '',
    lastname: this.user?.lastname ?? '',
    phone: this.user?.phone ?? '',
  };

  async onSubmit(form: NgForm) {
    this.profile.name = this.profile.name?.trim() ?? '';
    if (!this.profile.name) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name is required.',
        life: 3000,
      });
      return;
    }
    if (form.invalid) return;

    this.loading.set(true);
    try {
      await this.userService.updateProfile({ ...this.profile });
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated.',
        life: 3000,
      });
      this.ref.close(true);
    } catch {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update profile.',
        life: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  close() {
    this.ref.close(false);
  }
}
