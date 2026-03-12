import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateProfileButtonComponent } from '@/features/account/update-profile/update-button.component';
import { EditProfileModalComponent } from '@/features/account/update-profile/edit-profile-modal.component';
import { LogoutButtonComponent } from '@/entities/logout-button/logout-button';
import { User, UserService } from '@/shared';
import { MessageService } from 'primeng/api';
import { environment } from '@/environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [
    CommonModule,
    UpdateProfileButtonComponent,
    LogoutButtonComponent,
    DynamicDialogModule,
    AppIconComponent,
  ],
  providers: [DialogService],
})
export class AccountComponent {
  user = input<User | null>(null);
  avatarLoadError = signal(false);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  avatarLoading = signal(false);

  openEditProfileDialog(): void {
    const u = this.user();
    if (!u) return;
    this.dialogService.open(EditProfileModalComponent, {
      header: 'Update Profile',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: { ...u },
    });
  }

  /** Full URL for avatar (relative paths get API base prepended). */
  avatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    const base = environment.apiUrl ?? '';
    return base ? `${base}/api${avatar.startsWith('/') ? avatar : '/' + avatar}` : avatar;
  }

  /** Open avatar image in new tab for full-size view. */
  openFullSize(url: string): void {
    if (url) window.open(url, '_blank', 'noopener');
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Invalid file',
        detail: 'Please select an image file.',
        life: 3000,
      });
      input.value = '';
      return;
    }

    this.avatarLoading.set(true);
    input.value = '';
    try {
      await this.userService.uploadAvatar(file);
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Profile picture updated.',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload photo.',
        life: 4000,
      });
    } finally {
      this.avatarLoading.set(false);
    }
  }
}
