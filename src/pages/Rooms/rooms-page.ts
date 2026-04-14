import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoutePaths } from '@/shared';
import { GroupRoomItem } from '@/shared/types';
import { GroupRoomsHttpService, SseEventsService } from '@/shared/services/models';
import { AuthService } from '@/shared/services/auth/auth.service';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { ConfirmationService, MessageService } from 'primeng/api';

const ROOM_CURRENCIES = ['BYN', 'USD', 'EUR', 'RUB'] as const;

@Component({
  selector: 'app-rooms-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DialogModule,
    InputTextModule,
    AppModalShellComponent,
    AppButtonComponent,
    AppIconComponent,
    ContextMenuComponent,
  ],
  templateUrl: './rooms-page.html',
  styleUrl: './rooms-page.scss',
})
export class RoomsPageComponent implements OnInit, OnDestroy {
  private readonly groupRoomsHttp = inject(GroupRoomsHttpService);
  private readonly sseEvents = inject(SseEventsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currencyService = inject(CurrencyService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly routePaths = RoutePaths;
  readonly rooms = signal<GroupRoomItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly roomName = signal<string>('');
  readonly roomDescription = signal<string>('');
  readonly inviteToken = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  readonly createRoomDialogVisible = signal(false);
  readonly inviteDialogVisible = signal(false);
  readonly editRoomDialogVisible = signal(false);
  readonly editingRoomId = signal<string | null>(null);
  readonly editRoomName = signal<string>('');
  readonly editRoomDescription = signal<string>('');

  readonly roomStats = computed(() => {
    const all = this.rooms();
    return {
      total: all.length,
      owned: all.filter((item) => item.role === 'owner').length,
      joined: all.filter((item) => item.role !== 'owner').length,
    };
  });

  constructor() {
    effect(() => {
      const token = this.auth.getAccessToken();
      if (!token) return;
      const event = this.sseEvents.lastGroupEvent();
      if (!event) return;
      if (
        event.type === 'room_created' ||
        event.type === 'member_joined' ||
        event.type === 'member_removed' ||
        event.type === 'invite_created' ||
        event.type === 'room_updated' ||
        event.type === 'room_deleted'
      ) {
        this.loadRooms().catch(() => undefined);
      }
    });
  }

  async ngOnInit() {
    await this.loadRooms();
    const token = this.auth.getAccessToken();
    if (token) {
      this.sseEvents.connectGroupEvents(token);
    }
  }

  ngOnDestroy(): void {
    this.sseEvents.disconnect();
  }

  openCreateRoomDialog(): void {
    this.createRoomDialogVisible.set(true);
  }

  closeCreateRoomDialog(): void {
    this.createRoomDialogVisible.set(false);
    this.roomName.set('');
    this.roomDescription.set('');
  }

  onCreateDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeCreateRoomDialog();
  }

  openInviteDialog(): void {
    this.inviteDialogVisible.set(true);
  }

  closeInviteDialog(): void {
    this.inviteDialogVisible.set(false);
    this.inviteToken.set('');
  }

  onInviteDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeInviteDialog();
  }

  canManageRoom(room: GroupRoomItem): boolean {
    return room.role === 'owner' || room.role === 'admin';
  }

  openEditRoom(room: GroupRoomItem): void {
    this.editingRoomId.set(room.id);
    this.editRoomName.set(room.name);
    this.editRoomDescription.set(room.description?.trim() ? room.description : '');
    this.editRoomDialogVisible.set(true);
  }

  closeEditRoomDialog(): void {
    this.editRoomDialogVisible.set(false);
    this.editingRoomId.set(null);
    this.editRoomName.set('');
    this.editRoomDescription.set('');
  }

  onEditDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeEditRoomDialog();
  }

  submitEditRoom(form: NgForm): void {
    form.form.markAllAsTouched();
    if (!this.editRoomName().trim()) return;
    void this.saveRoomEdit();
  }

  async saveRoomEdit() {
    const id = this.editingRoomId();
    if (!id) return;
    const name = this.editRoomName().trim();
    if (!name) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      await this.groupRoomsHttp.updateRoom(id, {
        name,
        description: this.editRoomDescription().trim() || undefined,
      });
      this.closeEditRoomDialog();
      await this.loadRooms();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Room updated',
        detail: 'Changes saved successfully.',
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Could not update room',
        detail: 'Check your connection and try again.',
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  confirmDeleteRoom(room: GroupRoomItem): void {
    this.confirmationService.confirm({
      message: `Delete room «${room.name}»? This cannot be undone.`,
      header: 'Delete room',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        void this.deleteRoom(room.id);
      },
    });
  }

  async deleteRoom(roomId: string) {
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      await this.groupRoomsHttp.deleteRoom(roomId);
      await this.loadRooms();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Room deleted',
        detail: 'The room was removed successfully.',
        life: 3000,
      });
      if (this.router.url.includes(roomId)) {
        await this.router.navigate(['/', RoutePaths.ROOMS]);
      }
    } catch (err) {
      console.error(err);
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Could not delete room',
        detail: 'Check your connection and try again.',
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  submitCreateRoom(form: NgForm): void {
    form.form.markAllAsTouched();
    if (!this.roomName().trim()) return;
    void this.createRoom();
  }

  canSubmitInvite(): boolean {
    return this.inviteToken().trim().length > 0;
  }

  async loadRooms() {
    this.isLoading.set(true);
    this.error.set('');
    try {
      const data = await this.groupRoomsHttp.getMyRooms();
      this.rooms.set(data);
    } catch (err) {
      console.error(err);
      this.error.set('Failed to load rooms');
    } finally {
      this.isLoading.set(false);
    }
  }

  async createRoom() {
    const name = this.roomName().trim();
    if (!name) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      const cur = this.currencyService.primaryCode().trim().toUpperCase();
      const currencyCode = ROOM_CURRENCIES.includes(cur as (typeof ROOM_CURRENCIES)[number])
        ? cur
        : 'BYN';
      const created = await this.groupRoomsHttp.createRoom({
        name,
        description: this.roomDescription().trim() || undefined,
        currencyCode,
      });
      this.closeCreateRoomDialog();
      await this.loadRooms();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Room created',
        detail: `Room "${created.name}" is ready.`,
        life: 3000,
      });
      await this.router.navigate(['/', RoutePaths.ROOM_DETAILS, created.id], {
        queryParams: { tab: 'overview' },
        replaceUrl: false,
      });
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create room');
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Could not create room',
        detail: 'Check your connection and try again.',
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async acceptInvite() {
    const token = this.inviteToken().trim();
    if (!token) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      await this.groupRoomsHttp.acceptInvite(token);
      this.closeInviteDialog();
      await this.loadRooms();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Invite accepted',
        detail: 'You have joined the room.',
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set('Failed to accept invite');
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Could not accept invite',
        detail: 'Token may be invalid or expired.',
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async rejectInvite() {
    const token = this.inviteToken().trim();
    if (!token) return;
    this.isSubmitting.set(true);
    this.error.set('');
    try {
      await this.groupRoomsHttp.rejectInvite(token);
      this.closeInviteDialog();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Invite rejected',
        detail: 'The invite has been declined.',
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set('Failed to reject invite');
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Could not reject invite',
        detail: 'Please try again.',
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
