import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoutePaths } from '@/shared';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { GroupRoomDetails } from '@/shared/types';
import { GroupRoomsHttpService, SseEventsService } from '@/shared/services/models';
import { AuthService } from '@/shared/services/auth/auth.service';
import { shouldSyncTabToUrl } from '@/shared/lib/platform-url-sync';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { DashboardCardsComponent } from '@/widgets/dashboardCards/dashboardCards.component';
import { TransactionWidgetComponent } from '@/widgets/transactionWidget/transaction-widget.component';
import { CategoriesCardsComponent } from '@/widgets/categoriesCards/ui/categoriesCards.component';
import { GoalsCardsComponent } from '@/widgets/goalsCards/goalsCards.component';
import { SubscribeTableComponent } from '@/entities/cards/subscribtions/ui/page/ui/subscribe-table.component';

export type RoomTabId =
  | 'overview'
  | 'transactions'
  | 'categories'
  | 'goals'
  | 'subscriptions'
  | 'members';

const ROOM_TAB_IDS: readonly RoomTabId[] = [
  'overview',
  'transactions',
  'categories',
  'goals',
  'subscriptions',
  'members',
] as const;

function isRoomTabId(v: string): v is RoomTabId {
  return (ROOM_TAB_IDS as readonly string[]).includes(v);
}

@Component({
  selector: 'app-room-details-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DialogModule,
    InputTextModule,
    AppModalShellComponent,
    AppButtonComponent,
    AppIconComponent,
    DashboardCardsComponent,
    TransactionWidgetComponent,
    CategoriesCardsComponent,
    GoalsCardsComponent,
    SubscribeTableComponent,
  ],
  templateUrl: './room-details-page.html',
  styleUrl: './room-details-page.scss',
})
export class RoomDetailsPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly groupRoomsHttp = inject(GroupRoomsHttpService);
  private readonly sseEvents = inject(SseEventsService);
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly routePaths = RoutePaths;

  readonly tabDefs: { id: RoomTabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'categories', label: 'Categories' },
    { id: 'goals', label: 'Goals' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'members', label: 'Members' },
  ];

  readonly activeTab = signal<RoomTabId>('overview');

  readonly roomId = signal<string>('');
  readonly room = signal<GroupRoomDetails | null>(null);

  readonly error = signal<string>('');
  readonly inviteHours = signal<number>(72);
  readonly createdInviteToken = signal<string>('');
  readonly inviteDialogVisible = signal(false);
  readonly isCreatingInvite = signal(false);

  readonly inviteHoursValid = computed(() => {
    const h = this.inviteHours();
    return Number.isFinite(h) && h >= 1 && h <= 8760;
  });

  constructor() {
    effect(() => {
      const event = this.sseEvents.lastGroupEvent();
      const rid = this.roomId();
      if (!event || event.roomId !== rid || !rid) return;
      void this.loadRoom();
      void this.queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey as unknown[];
          if (k[0] === 'groupTransactions' && k[1] === rid) return true;
          if (k[0] === 'categories' && k[1] === 'scope' && k[2] === rid) return true;
          if (k[0] === 'goals' && k[1] === 'room' && k[2] === rid) return true;
          if (k[0] === 'subscriptions' && k[1] === 'room' && k[2] === rid) return true;
          if (k[0] === 'charts' && k[1] === 'room' && k[2] === rid) return true;
          if (k[0] === 'roomContributions' && k[1] === rid) return true;
          return false;
        },
      });
    });
  }

  async ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.roomId.set(roomId);

    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && isRoomTabId(tabParam)) {
      this.activeTab.set(tabParam);
    }

    if (shouldSyncTabToUrl()) {
      this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const t = params.get('tab');
        if (t && isRoomTabId(t)) {
          this.activeTab.set(t);
        }
      });
    }

    await this.loadRoom();

    const token = this.auth.getAccessToken();
    if (token) {
      this.sseEvents.connectGroupEvents(token);
    }
  }

  ngOnDestroy(): void {
    this.sseEvents.disconnect();
  }

  setTab(tab: RoomTabId): void {
    this.activeTab.set(tab);
    if (shouldSyncTabToUrl()) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  private async loadRoom() {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      const r = await this.groupRoomsHttp.getRoomDetails(roomId);
      this.room.set(r);
    } catch (err) {
      console.error(err);
      this.error.set('Failed to load room');
    }
  }

  openInviteDialog(): void {
    this.inviteDialogVisible.set(true);
  }

  closeInviteDialog(): void {
    this.inviteDialogVisible.set(false);
  }

  onInviteDialogVisibleChange(visible: boolean): void {
    this.inviteDialogVisible.set(visible);
  }

  onInviteHoursInput(raw: unknown): void {
    if (raw === null || raw === undefined || raw === '') {
      this.inviteHours.set(1);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) {
      this.inviteHours.set(1);
      return;
    }
    this.inviteHours.set(Math.min(8760, Math.floor(n)));
  }

  async createInvite() {
    const roomId = this.roomId();
    if (!roomId || !this.inviteHoursValid()) return;
    this.error.set('');
    this.isCreatingInvite.set(true);
    try {
      const invite = await this.groupRoomsHttp.createInvite(roomId, {
        expiresInHours: this.inviteHours(),
      });
      this.createdInviteToken.set(invite.token);
      this.inviteDialogVisible.set(false);
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create invite');
    } finally {
      this.isCreatingInvite.set(false);
    }
  }

  async updateRole(userId: string, role: 'admin' | 'member') {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      await this.groupRoomsHttp.updateMemberRole(roomId, userId, role);
      await this.loadRoom();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to update role');
    }
  }

  async removeMember(userId: string) {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      await this.groupRoomsHttp.removeMember(roomId, userId);
      await this.loadRoom();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to remove member');
    }
  }
}
