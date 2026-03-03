import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import {
  User,
  UserService,
  BelarusPhoneMaskDirective,
  BelarusPhoneValidatorDirective,
  EmailValidatorDirective,
} from '@/shared';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    BelarusPhoneMaskDirective,
    BelarusPhoneValidatorDirective,
    EmailValidatorDirective,
  ],
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
    email: this.user?.email ?? '',
    phone: this.user?.phone ?? '',
  };

  async onSubmit(form: NgForm) {
    this.profile.name = this.profile.name?.trim() ?? '';
    this.profile.email = this.profile.email?.trim() ?? '';
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
    if (!this.profile.email) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Validation',
        detail: 'Email is required.',
        life: 3000,
      });
      return;
    }
    if (form.invalid) return;

    const payload = {
      name: this.profile.name,
      lastname: this.profile.lastname,
      email: this.profile.email?.trim() ?? '',
      phone: this.profile.phone || undefined,
    };

    this.loading.set(true);
    try {
      await this.userService.updateProfile(payload);
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
