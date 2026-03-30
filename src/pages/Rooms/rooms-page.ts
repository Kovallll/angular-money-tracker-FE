import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoutePaths } from '@/shared';
import { GroupRoomItem } from '@/shared/types';
import { GroupRoomsHttpService, SseEventsService } from '@/shared/services/models';
import { AuthService } from '@/shared/services/auth/auth.service';

const ROOM_CURRENCIES = ['BYN', 'USD', 'EUR', 'RUB'] as const;

@Component({
  selector: 'app-rooms-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rooms-page.html',
  styleUrl: './rooms-page.scss',
})
export class RoomsPageComponent implements OnInit, OnDestroy {
  private readonly groupRoomsHttp = inject(GroupRoomsHttpService);
  private readonly sseEvents = inject(SseEventsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly routePaths = RoutePaths;
  readonly rooms = signal<GroupRoomItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly roomName = signal<string>('');
  readonly roomDescription = signal<string>('');
  readonly roomCurrencyCode = signal<string>('BYN');
  readonly roomAvatarUrl = signal<string>('');
  readonly inviteToken = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  readonly currencyOptions = ROOM_CURRENCIES;

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
      const avatar = this.roomAvatarUrl().trim();
      const cur = this.roomCurrencyCode().trim().toUpperCase();
      const currencyCode = ROOM_CURRENCIES.includes(cur as (typeof ROOM_CURRENCIES)[number])
        ? cur
        : 'BYN';
      const created = await this.groupRoomsHttp.createRoom({
        name,
        description: this.roomDescription().trim() || undefined,
        currencyCode,
        ...(avatar ? { avatar } : {}),
      });
      this.roomName.set('');
      this.roomDescription.set('');
      this.roomAvatarUrl.set('');
      this.roomCurrencyCode.set('BYN');
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
      this.inviteToken.set('');
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
      this.inviteToken.set('');
    } catch (err) {
      console.error(err);
      this.error.set('Failed to reject invite');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
