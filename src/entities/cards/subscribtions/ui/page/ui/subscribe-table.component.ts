import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { SubscribtionsService } from '../../../services/subscribtions.service';
import { DatePipe } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { NextChargeDatePipe } from '@/shared/pipes/next-charge-date.pipe';
import { SubscriptionYearlyPipe } from '@/shared/pipes/subscription-yearly.pipe';
import { ControlsComponent } from '@/widgets/controls/ui/controls.component';
import { ControlsProps } from '@/widgets/controls/lib';
import { TableCell } from '@/entities/table/lib';
import {
  BalancesHttpService,
  CategoriesHttpService,
  ExpensesHttpService,
  SubscribeItem,
  SUBSCRIPTIONS_CATEGORY_NAME,
  SubscribtionsHttpService,
  TransactionsHttpService,
  UrlSyncedComponent,
} from '@/shared';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { GroupRoomsHttpService } from '@/shared/services/models';

import { columns, searchProps } from '../lib';
import { PaginationComponent } from '@/entities/pagination/ui/pagination.component';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DialogService } from 'primeng/dynamicdialog';
import { EditSubscriptionModalComponent } from '@/features/subscriptions/edit-modal/edit-card-modal.component';
import { SubscriptionAddButtonComponent } from '@/features/subscriptions/add-button/add-card.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import dayjs from 'dayjs';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { RowMenuButtonComponent } from '@/shared/components/row-menu-button/row-menu-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  selector: 'subscribe-table',
  templateUrl: './subscribe-table.component.html',
  styleUrls: ['./subscribe-table.component.scss'],
  imports: [
    DatePipe,
    AppCurrencyPrimaryPipe,
    NextChargeDatePipe,
    SubscriptionYearlyPipe,
    ControlsComponent,
    PaginationComponent,
    ContextMenuComponent,
    SubscriptionAddButtonComponent,
    ProgressSpinner,
    AppIconComponent,
    RowMenuButtonComponent,
    TranslateModule,
  ],
  standalone: true,
  providers: [DialogService],
})
export class SubscribeTableComponent extends UrlSyncedComponent<SubscribeItem> {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;
  private readonly subscribtionsService = inject(SubscribtionsService);
  private readonly subscribeHttpService = inject(SubscribtionsHttpService);
  private readonly queryClient = inject(QueryClient);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly transactionsHttpService = inject(TransactionsHttpService);
  private readonly balancesHttpService = inject(BalancesHttpService);
  private readonly categoriesHttpService = inject(CategoriesHttpService);
  private readonly groupRoomsHttp = inject(GroupRoomsHttpService);
  private readonly expensesHttpService = inject(ExpensesHttpService);
  private readonly messageService = inject(MessageService);
  private readonly exchangeRates = inject(ExchangeRatesService);
  private readonly i18n = inject(I18nService);

  groupRoomId = input<string | undefined>(undefined);
  embedded = input(false);

  subscribes = signal<SubscribeItem[]>([]);
  selectedSubscribe = signal<SubscribeItem | null>(null);

  roomSubsQuery = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['subscriptions', 'room', rid] as const,
      queryFn: () => lastValueFrom(this.subscribeHttpService.fetchSubscriptionsForRoom(rid)),
      enabled: !!rid,
    };
  });

  readonly isLoading = computed(() =>
    this.groupRoomId()?.trim()
      ? this.roomSubsQuery.isPending()
      : this.subscribeHttpService.isLoading(),
  );

  allData: Signal<SubscribeItem[]> = computed(() =>
    this.groupRoomId()?.trim()
      ? (this.roomSubsQuery.data() ?? [])
      : this.subscribtionsService.getSubscribes(),
  );

  displayedCells = signal<TableCell[]>(columns);

  override get isEmpty() {
    return this.subscribes().length === 0;
  }

  constructor(public dialogService: DialogService) {
    super();

    this.initPageSize(9);

    // При обновлении списка с сервера (в т.ч. после Mark paid) синхронизируем отображаемый список с URL и данными
    effect(() => {
      this.subscribeHttpService.subscriptions();
      this.roomSubsQuery.data();
      this.sync();
    });
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscribes.set(this.subscribtionsService.getSubscribes());
  }

  controlsProps = computed<ControlsProps>(() => ({
    filterProps: {
      data: this.subscribtionsService.getSubscribes(),
      filterFields: this.displayedCells(),
    },
    sortersProps: {
      sortersFields: this.displayedCells(),
    },
    searchProps,
  }));

  setUpdatedData(updatedData: SubscribeItem[]): void {
    this.subscribes.set(updatedData);
  }

  openActionsMenu(event: Event, subscribe: SubscribeItem) {
    event.stopPropagation();
    this.selectedSubscribe.set(subscribe);
    this.ctxMenu.toggle(event);
  }

  onDelete(subscribe: SubscribeItem | null) {
    if (!subscribe) return;
    this.confirmationService.confirm({
      message: `Delete subscription «${subscribe.subscribeName}»?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.subscribeHttpService.delete(subscribe.id).subscribe(() => {
          const rid = this.groupRoomId()?.trim();
          if (rid) {
            void this.queryClient.invalidateQueries({ queryKey: ['subscriptions', 'room', rid] });
          } else {
            this.subscribeHttpService.loadAll();
          }
        });
      },
    });
  }

  isOneTime(type: string | undefined): boolean {
    const t = (type || '').toLowerCase();
    return t === 'onetime' || t === 'one-time';
  }

  onEdit(subscribe: SubscribeItem | null) {
    if (!subscribe) return;
    this.dialogService.open(EditSubscriptionModalComponent, {
      header: 'Edit Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: subscribe,
    });
  }

  private getTodayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getNextChargeDate(sub: SubscribeItem, baseDate: string): Date | null {
    const type = (sub.type || '').toLowerCase();
    if (type === 'onetime' || type === 'one-time') return null;
    const d = dayjs(baseDate);
    let next = d;
    if (type === 'daily') next = d.add(1, 'day');
    else if (type === 'monthly') next = d.add(1, 'month');
    else if (type === 'yearly' || type === 'annually') next = d.add(1, 'year');
    else next = d.add(1, 'month');
    return next.toDate();
  }

  /** Текущая дата следующего платежа (тот, что отображается как Next). Для recurring — lastCharge/subscribeDate + интервал. */
  private getCurrentNextChargeDate(sub: SubscribeItem): Date | null {
    const base = sub.lastCharge || sub.subscribeDate;
    if (!base) return null;
    return this.getNextChargeDate(sub, base);
  }

  formatType(type: string | undefined): string {
    const t = (type || '').trim().toLowerCase();
    if (!t) return '—';
    return t === 'one-time' || t === 'onetime' ? 'onetime' : t === 'annually' ? 'yearly' : t;
  }

  async markAsPaid(event: MouseEvent, subscribe: SubscribeItem) {
    const roomId = this.groupRoomId()?.trim() ?? '';
    event.stopPropagation();
    const today = this.getTodayString();
    const isOneTime = this.isOneTime(subscribe.type);
    // Для recurring: дата оплаты = текущий Next (тот платёж, что отмечаем); новый Next = эта дата + интервал
    const currentNext = this.getCurrentNextChargeDate(subscribe);
    const paidDateStr =
      !isOneTime && currentNext != null ? dayjs(currentNext).format('YYYY-MM-DD') : today;
    const newNextDate = this.getNextChargeDate(subscribe, paidDateStr);
    const newNextStr = newNextDate != null ? dayjs(newNextDate).format('MMM D, YYYY') : null;
    const paidDateFormatted =
      paidDateStr === today ? 'today' : dayjs(paidDateStr).format('MMM D, YYYY');

    const categories = roomId
      ? await this.categoriesHttpService.fetchCategoriesByRoom(roomId)
      : await this.categoriesHttpService.getCategories();
    const categoryId =
      subscribe.categoryId ||
      categories.find(
        (c) => String(c.title ?? '').toLowerCase() === SUBSCRIPTIONS_CATEGORY_NAME.toLowerCase(),
      )?.id;
    const categoryName =
      categoryId != null
        ? (categories.find((c) => String(c.id) === String(categoryId))?.title ?? 'Subscriptions')
        : 'Subscriptions';
    const typeLabel = this.i18n.t(`subscriptions.type.${this.formatType(subscribe.type)}`);

    const lines: string[] = [
      `Mark «${subscribe.subscribeName}» as paid ${paidDateFormatted}?`,
      `A transaction will be created with category: <strong>${categoryName}</strong>.`,
      `The payment date will be updated to <strong>${paidDateFormatted}</strong>, the next payment will become <strong>${newNextStr ?? '—'}</strong>.`,
      `Type: <strong>${typeLabel}</strong>.`,
    ];
    const message = lines.join('<br>');

    this.confirmationService.confirm({
      message,
      header: 'Mark as paid',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: async () => {
        try {
          await firstValueFrom(
            this.subscribeHttpService.update(subscribe.id, { lastCharge: paidDateStr }),
          );

          const fromCode = subscribe.currencyCode ?? 'BYN';
          const normalizedAmount = this.exchangeRates.convert(subscribe.amount, fromCode, 'BYN');

          if (roomId) {
            await this.groupRoomsHttp.createRoomTransaction(roomId, {
              type: 'expense',
              title: subscribe.subscribeName,
              amount: normalizedAmount,
              currencyCode: 'BYN',
              date: paidDateStr,
              paymentMethod: 'cash',
              ...(categoryId ? { categoryId: String(categoryId) } : {}),
            });
            void this.queryClient.invalidateQueries({
              queryKey: ['subscriptions', 'room', roomId],
            });
            void this.queryClient.invalidateQueries({ queryKey: ['groupTransactions', roomId] });
            void this.queryClient.invalidateQueries({ queryKey: ['charts', 'room', roomId] });
            void this.queryClient.invalidateQueries({ queryKey: ['roomContributions', roomId] });
            this.messageService.add({
              key: 'toast',
              severity: 'success',
              summary: 'Marked as paid',
              detail: `${subscribe.subscribeName} — transaction created`,
              life: 3000,
            });
            return;
          }

          const cards = this.balancesHttpService.cards();
          const primaryCard = cards.find((c) => c.isPrimary) ?? cards[0];
          const cardId = primaryCard?.id;
          if (!categoryId || !cardId) {
            this.messageService.add({
              key: 'toast',
              severity: 'warn',
              summary: 'Cannot create transaction',
              detail: categoryId ? 'Add a card first' : 'Set up the Subscriptions category',
              life: 4000,
            });
            return;
          }

          await this.transactionsHttpService.createTransaction({
            cardId: String(cardId),
            categoryId: String(categoryId),
            type: 'expense',
            amount: normalizedAmount,
            currencyCode: 'BYN',
            date: paidDateStr,
            title: subscribe.subscribeName,
          });
          this.balancesHttpService.refresh();
          this.subscribeHttpService.loadAll();
          this.categoriesHttpService.refreshCategories();
          this.transactionsHttpService.loadTransactions();
          this.expensesHttpService.refreshExpenses();
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Marked as paid',
            detail: `${subscribe.subscribeName} — transaction created`,
            life: 3000,
          });
        } catch {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark as paid',
            life: 4000,
          });
        }
      },
    });
  }
}
