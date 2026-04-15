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
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

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
    TranslateModule,
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
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(I18nService);

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
      if (!event || !rid) return;
      if (event.type === 'room_deleted' && event.roomId === rid) {
        void this.router.navigate(['/', RoutePaths.ROOMS]);
        return;
      }
      if (event.roomId !== rid) return;
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

  setTab(tab: RoomTabId, options?: { focusTab?: boolean }): void {
    this.activeTab.set(tab);
    if (shouldSyncTabToUrl()) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    if (options?.focusTab) {
      queueMicrotask(() => document.getElementById(`room-tab-${tab}`)?.focus());
    }
  }

  onRoomTabsKeydown(ev: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ev.key)) return;
    ev.preventDefault();
    const order = [...ROOM_TAB_IDS];
    const i = order.indexOf(this.activeTab());
    const idx = i < 0 ? 0 : i;
    if (ev.key === 'Home') {
      this.setTab(order[0], { focusTab: true });
      return;
    }
    if (ev.key === 'End') {
      this.setTab(order[order.length - 1], { focusTab: true });
      return;
    }
    if (ev.key === 'ArrowLeft') {
      this.setTab(order[idx === 0 ? order.length - 1 : idx - 1], { focusTab: true });
      return;
    }
    if (ev.key === 'ArrowRight') {
      this.setTab(order[idx === order.length - 1 ? 0 : idx + 1], { focusTab: true });
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
      this.error.set(this.i18n.t('rooms.details.errors.failedToLoadRoom'));
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
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('rooms.details.toast.inviteCreated'),
        detail: this.i18n.t('rooms.details.toast.tokenGenerated'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.details.errors.failedToCreateInvite'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.details.toast.couldNotCreateInvite'),
        detail: this.i18n.t('rooms.toast.pleaseTryAgain'),
        life: 5000,
      });
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
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('rooms.details.toast.roleUpdated'),
        detail:
          role === 'admin'
            ? this.i18n.t('rooms.details.toast.memberPromoted')
            : this.i18n.t('rooms.details.toast.adminDemoted'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.details.errors.failedToUpdateRole'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.details.toast.couldNotUpdateRole'),
        detail: this.i18n.t('rooms.toast.pleaseTryAgain'),
        life: 5000,
      });
    }
  }

  async removeMember(userId: string) {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      await this.groupRoomsHttp.removeMember(roomId, userId);
      await this.loadRoom();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: this.i18n.t('rooms.details.toast.memberRemoved'),
        detail: this.i18n.t('rooms.details.toast.memberRemovedDetail'),
        life: 3000,
      });
    } catch (err) {
      console.error(err);
      this.error.set(this.i18n.t('rooms.details.errors.failedToRemoveMember'));
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: this.i18n.t('rooms.details.toast.couldNotRemoveMember'),
        detail: this.i18n.t('rooms.toast.pleaseTryAgain'),
        life: 5000,
      });
    }
  }
}
