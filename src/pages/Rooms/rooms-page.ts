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
        event.type === 'invite_created'
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
      await this.router.navigate(['/', RoutePaths.ROOM_DETAILS, created.id], {
        queryParams: { tab: 'overview' },
        replaceUrl: false,
      });
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create room');
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
    } catch (err) {
      console.error(err);
      this.error.set('Failed to accept invite');
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
    } catch (err) {
      console.error(err);
      this.error.set('Failed to reject invite');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
