import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '@/shared';
import { MessageService } from 'primeng/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';

@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  imports: [FormsModule, MatFormFieldModule, MatInputModule, AppButtonComponent],
})
export class SecurityComponent {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  loading = signal(false);

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'New password must be at least 6 characters.',
        life: 4000,
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'New password and confirmation do not match.',
        life: 4000,
      });
      return;
    }

    this.loading.set(true);
    try {
      await this.userService.changePassword(this.oldPassword, this.newPassword);
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Password changed.',
        life: 3000,
      });
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      form.resetForm();
    } catch (err: any) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message ?? 'Failed to change password.',
        life: 5000,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
