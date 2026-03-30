import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CategoryItem,
  ExpensesOverviewDto,
  GoalItem,
  GroupRoomDetails,
  GroupTransactionItem,
  SubscribeItem,
} from '@/shared/types';
import {
  CategoriesHttpService,
  GoalsHttpService,
  GroupRoomsHttpService,
  SseEventsService,
  StatisticsHttpService,
  SubscribtionsHttpService,
} from '@/shared/services/models';
import { AuthService } from '@/shared/services/auth/auth.service';
import { DEFAULT_CATEGORY_ICON } from '@/shared/constants';
import { shouldSyncTabToUrl } from '@/shared/lib/platform-url-sync';
import { lastValueFrom } from 'rxjs';

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
  imports: [CommonModule, FormsModule],
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
  private readonly categoriesHttp = inject(CategoriesHttpService);
  private readonly goalsHttp = inject(GoalsHttpService);
  private readonly subsHttp = inject(SubscribtionsHttpService);
  private readonly statsHttp = inject(StatisticsHttpService);

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
  readonly transactions = signal<GroupTransactionItem[]>([]);
  readonly roomCategories = signal<CategoryItem[]>([]);
  readonly roomGoals = signal<GoalItem[]>([]);
  readonly roomSubscriptions = signal<SubscribeItem[]>([]);
  readonly roomOverview = signal<ExpensesOverviewDto | null>(null);

  readonly error = signal<string>('');
  readonly inviteHours = signal<number>(72);
  readonly createdInviteToken = signal<string>('');
  readonly txTitle = signal<string>('');
  readonly txAmount = signal<number>(0);
  readonly txDate = signal<string>(new Date().toISOString().slice(0, 10));
  readonly txCategoryId = signal<string>('');

  readonly catTitle = signal<string>('');
  readonly gTitle = signal<string>('');
  readonly gTarget = signal<number>(0);
  readonly gGoal = signal<number>(0);
  readonly gStart = signal<string>(new Date().toISOString().slice(0, 10));
  readonly gEnd = signal<string>('');
  readonly sName = signal<string>('');
  readonly sAmount = signal<number>(0);
  readonly sDate = signal<string>(new Date().toISOString().slice(0, 10));
  readonly sType = signal<string>('monthly');

  constructor() {
    effect(() => {
      const event = this.sseEvents.lastGroupEvent();
      if (!event || event.roomId !== this.roomId()) return;
      this.reloadAll().catch(() => undefined);
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

    await this.reloadAll();

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

  async reloadAll() {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      const [room, tx, cats, goals, subs, overview] = await Promise.all([
        this.groupRoomsHttp.getRoomDetails(roomId),
        this.groupRoomsHttp.getRoomTransactions(roomId),
        this.categoriesHttp.fetchCategoriesByRoom(roomId).catch(() => [] as CategoryItem[]),
        lastValueFrom(this.goalsHttp.fetchGoalsForRoom(roomId)).catch(() => [] as GoalItem[]),
        lastValueFrom(this.subsHttp.fetchSubscriptionsForRoom(roomId)).catch(
          () => [] as SubscribeItem[],
        ),
        lastValueFrom(this.statsHttp.getExpensesOverview({ roomId })).catch(() => null),
      ]);
      this.room.set(room);
      this.transactions.set(tx);
      this.roomCategories.set(cats);
      this.roomGoals.set([...goals].reverse());
      this.roomSubscriptions.set(subs);
      this.roomOverview.set(overview);
    } catch (err) {
      console.error(err);
      this.error.set('Failed to load room');
    }
  }

  async createInvite() {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      const invite = await this.groupRoomsHttp.createInvite(roomId, {
        expiresInHours: this.inviteHours(),
      });
      this.createdInviteToken.set(invite.token);
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create invite');
    }
  }

  async updateRole(userId: string, role: 'admin' | 'member') {
    const roomId = this.roomId();
    if (!roomId) return;
    this.error.set('');
    try {
      await this.groupRoomsHttp.updateMemberRole(roomId, userId, role);
      await this.reloadAll();
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
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to remove member');
    }
  }

  async createTransaction() {
    const roomId = this.roomId();
    if (!roomId) return;
    if (!this.txTitle().trim() || this.txAmount() <= 0) return;
    this.error.set('');
    try {
      const cat = this.txCategoryId().trim();
      await this.groupRoomsHttp.createRoomTransaction(roomId, {
        title: this.txTitle().trim(),
        amount: this.txAmount(),
        date: this.txDate(),
        ...(cat ? { categoryId: cat } : {}),
      });
      this.txTitle.set('');
      this.txAmount.set(0);
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create transaction');
    }
  }

  async createRoomCategory() {
    const roomId = this.roomId();
    const title = this.catTitle().trim();
    if (!roomId || !title) return;
    this.error.set('');
    try {
      await this.categoriesHttp.createCategoryInRoom(roomId, {
        title,
        icon: DEFAULT_CATEGORY_ICON,
      });
      this.catTitle.set('');
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create category');
    }
  }

  async createRoomGoal() {
    const roomId = this.roomId();
    const title = this.gTitle().trim();
    if (!roomId || !title) return;
    this.error.set('');
    try {
      await lastValueFrom(
        this.goalsHttp.createGoal(
          {
            title,
            targetBudget: this.gTarget(),
            goalBudget: this.gGoal(),
            startDate: this.gStart(),
            endDate: this.gEnd().trim() || undefined,
          },
          { groupRoomId: roomId },
        ),
      );
      this.gTitle.set('');
      this.gTarget.set(0);
      this.gGoal.set(0);
      this.gEnd.set('');
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create goal');
    }
  }

  async createRoomSubscription() {
    const roomId = this.roomId();
    const name = this.sName().trim();
    if (!roomId || !name || this.sAmount() < 0.01) return;
    this.error.set('');
    try {
      await lastValueFrom(
        this.subsHttp.create(
          {
            subscribeName: name,
            subscribeDate: this.sDate(),
            amount: this.sAmount(),
            lastCharge: null,
            type: this.sType().trim() || 'monthly',
            description: undefined,
          } as Omit<SubscribeItem, 'id'>,
          { groupRoomId: roomId },
        ),
      );
      this.sName.set('');
      this.sAmount.set(0);
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to create subscription');
    }
  }

  async deleteRoomGoal(id: string | number) {
    this.error.set('');
    try {
      await lastValueFrom(this.goalsHttp.deleteGoal(id));
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to delete goal');
    }
  }

  async deleteRoomSubscription(id: string | number) {
    this.error.set('');
    try {
      await lastValueFrom(this.subsHttp.delete(id));
      await this.reloadAll();
    } catch (err) {
      console.error(err);
      this.error.set('Failed to delete subscription');
    }
  }

  overviewMonthTotal(): number {
    const line = this.roomOverview()?.line;
    const data = line?.datasets?.[0]?.data ?? [];
    const idx = this.roomOverview()?.meta?.monthIndex;
    if (idx == null || !data.length) return 0;
    const v = data[idx];
    return typeof v === 'number' && Number.isFinite(v) ? v : 0;
  }
}
