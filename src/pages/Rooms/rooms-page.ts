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
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

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
    TranslateModule,
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
  private readonly i18n = inject(I18nService);

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
        summary: this.i18n.t('rooms.toast.roomUpdated'),
        detail: this.i18n.t('rooms.toast.changesSaved'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.toast.couldNotUpdateRoom'),
        detail: this.i18n.t('rooms.toast.checkConnection'),
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  confirmDeleteRoom(room: GroupRoomItem): void {
    this.confirmationService.confirm({
      message: this.i18n.t('rooms.deleteConfirmMessage', { name: room.name }),
      header: this.i18n.t('rooms.deleteRoom'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('common.delete'),
      rejectLabel: this.i18n.t('balances.cancel'),
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
        summary: this.i18n.t('rooms.toast.roomDeleted'),
        detail: this.i18n.t('rooms.toast.roomRemoved'),
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
        summary: this.i18n.t('rooms.toast.couldNotDeleteRoom'),
        detail: this.i18n.t('rooms.toast.checkConnection'),
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
      this.error.set(this.i18n.t('rooms.errors.loadRooms'));
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
        summary: this.i18n.t('rooms.toast.roomCreated'),
        detail: this.i18n.t('rooms.toast.roomReady', { name: created.name }),
        life: 3000,
      });
      await this.router.navigate(['/', RoutePaths.ROOM_DETAILS, created.id], {
        queryParams: { tab: 'overview' },
        replaceUrl: false,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.errors.createRoom'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.toast.couldNotCreateRoom'),
        detail: this.i18n.t('rooms.toast.checkConnection'),
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
        summary: this.i18n.t('rooms.toast.inviteAccepted'),
        detail: this.i18n.t('rooms.toast.joinedRoom'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.errors.acceptInvite'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.toast.couldNotAcceptInvite'),
        detail: this.i18n.t('rooms.toast.tokenInvalidOrExpired'),
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
        summary: this.i18n.t('rooms.toast.inviteRejected'),
        detail: this.i18n.t('rooms.toast.inviteDeclined'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.errors.rejectInvite'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.toast.couldNotRejectInvite'),
        detail: this.i18n.t('rooms.toast.pleaseTryAgain'),
        life: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
