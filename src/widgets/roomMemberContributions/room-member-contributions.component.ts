import { GroupRoomsHttpService, GroupTransactionItem, RoomContributionMember } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { Component, computed, inject, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProgressSpinner } from 'primeng/progressspinner';

const PALETTE = [
  '#5b7cff',
  '#33a0a0',
  '#cc9933',
  '#339966',
  '#cc3333',
  '#9966cc',
  '#e06666',
  '#6fa86f',
];

function safeCurrency(code: string | null | undefined): string {
  const c = (code ?? 'BYN').trim();
  return c || 'BYN';
}

@Component({
  selector: 'room-member-contributions',
  standalone: true,
  imports: [BaseChartDirective, ProgressSpinner],
  templateUrl: './room-member-contributions.component.html',
  styleUrl: './room-member-contributions.component.scss',
})
export class RoomMemberContributionsComponent {
  private groupRoomsHttp = inject(GroupRoomsHttpService);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);

  /** ID групповой комнаты */
  roomId = input.required<string>();

  private contributionsQuery = injectQuery(() => {
    const rid = this.roomId().trim();
    return {
      queryKey: ['roomContributions', rid] as const,
      queryFn: () => this.groupRoomsHttp.getRoomContributions(rid),
      enabled: !!rid,
      retry: 1,
    };
  });

  /** Те же транзакции, что в таблице — если /contributions пустой/ошибка, строим график локально. */
  private txQuery = injectQuery(() => {
    const rid = this.roomId().trim();
    return {
      queryKey: ['groupTransactions', rid] as const,
      queryFn: () => this.groupRoomsHttp.getRoomTransactions(rid),
      enabled: !!rid,
    };
  });

  /** Один ряд на участника: суммы в разных валютах схлопываем в основную валюту. */
  private mergedByUser = computed((): Array<{ name: string; amount: number }> => {
    const primary = this.currencyService.primaryCode();
    const apiRows = this.contributionsQuery.data()?.totalsByMember ?? [];
    const fromApi = this.mergeMemberRows(apiRows, primary);
    if (fromApi.length > 0) return fromApi;

    const txs = this.txQuery.data() ?? [];
    if (txs.length === 0) return [];
    return this.mergeFromTransactions(txs, primary);
  });

  private mergeMemberRows(rows: RoomContributionMember[], primary: string) {
    if (!rows.length) return [];
    const map = new Map<string, { name: string; amount: number }>();
    for (const r of rows) {
      const uid = (r.userId ?? '').trim();
      if (!uid) continue;
      const from = safeCurrency(r.currencyCode);
      const conv = this.exchangeRates.convert(Number(r.amount) || 0, from, primary);
      const prev = map.get(uid);
      if (prev) prev.amount += conv;
      else map.set(uid, { name: (r.name ?? '—').trim() || '—', amount: conv });
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }

  private mergeFromTransactions(txs: GroupTransactionItem[], primary: string) {
    const map = new Map<string, { name: string; amount: number }>();
    for (const t of txs) {
      const payerId = (t.paidBy || t.createdBy || '').trim();
      if (!payerId) continue;
      const from = safeCurrency(t.currencyCode);
      const conv = this.exchangeRates.convert(Number(t.amount) || 0, from, primary);
      const name =
        (t.paidByName && t.paidByName.trim()) || (t.createdByName && t.createdByName.trim()) || '—';
      const prev = map.get(payerId);
      if (prev) prev.amount += conv;
      else map.set(payerId, { name, amount: conv });
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }

  readonly hasData = computed(() => this.mergedByUser().length > 0);

  readonly chartData = computed((): ChartConfiguration<'doughnut'>['data'] => {
    const list = this.mergedByUser();
    return {
      labels: list.map((x) => x.name),
      datasets: [
        {
          data: list.map((x) => x.amount),
          backgroundColor: list.map((_, i) => PALETTE[i % PALETTE.length]),
          borderWidth: 0,
        },
      ],
    };
  });

  readonly chartOptions = computed((): ChartConfiguration<'doughnut'>['options'] => {
    const primary = this.currencyService.primaryCode();
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: primary,
      maximumFractionDigits: 0,
    });
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#c8d0e0', boxWidth: 12, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed;
              const n = typeof v === 'number' ? v : 0;
              return ` ${fmt.format(n)}`;
            },
          },
        },
      },
    };
  });

  /** Пока оба в полёте — спиннер; как только один ответил, можно строить график (API или fallback по транзакциям). */
  readonly isPending = computed(
    () => this.contributionsQuery.isPending() && this.txQuery.isPending(),
  );
}
