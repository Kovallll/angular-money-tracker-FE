import {
  ChartJsBar,
  ChartJsPie,
  ExpensesOverviewDto,
  StatisticsHttpService,
  StatisticsRefreshService,
  StatisticsPiePeriod,
} from '@/shared';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  OnInit,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartConfiguration, LegendItem, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { RoomMemberContributionsComponent } from '@/widgets/roomMemberContributions/room-member-contributions.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

const EMPTY_BAR: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
const EMPTY_LINE: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

const LEGEND_TAGS_CONTAINER = 'chart-legend-tags-container';

/** Общая палитра для синхронизации цветов категорий между pie и bar. */
const CATEGORY_COLOR_PALETTE = [
  '#5b7cff', // синий
  '#33a0a0', // бирюзовый
  '#cc9933', // оранжевый
  '#339966', // зелёный
  '#cc3333', // красный
  '#9966cc', // фиолетовый
  '#e06666', // светло-красный
  '#6fa86f', // зелёный 2
  '#cc79a7', // розовый
  '#88cc88', // салатовый
  '#6699cc', // голубой
  '#cc6666', // коралловый
];

function applySyncedColors(
  pie: ChartJsPie | undefined,
  bar: ChartJsBar | undefined,
): { pie: ChartJsPie | undefined; bar: ChartJsBar | undefined } {
  const names = new Set<string>();
  if (pie?.labels?.length) pie.labels.forEach((l) => names.add(l));
  if (bar?.datasets?.length) bar.datasets.forEach((ds) => names.add(ds.label));
  const sorted = Array.from(names).sort();
  const colorByLabel = new Map<string, string>();
  sorted.forEach((label, i) => {
    colorByLabel.set(label, CATEGORY_COLOR_PALETTE[i % CATEGORY_COLOR_PALETTE.length]);
  });
  const getColor = (label: string) => colorByLabel.get(label) ?? CATEGORY_COLOR_PALETTE[0];
  const newPie: ChartJsPie | undefined =
    pie?.labels?.length && pie?.datasets?.[0]
      ? {
          ...pie,
          datasets: pie.datasets.map((ds) => ({
            ...ds,
            backgroundColor: pie.labels.map((l) => getColor(l)),
          })),
        }
      : pie;
  const newBar: ChartJsBar | undefined = bar?.datasets?.length
    ? {
        ...bar,
        datasets: bar.datasets.map((ds) => ({ ...ds, backgroundColor: getColor(ds.label) })),
      }
    : bar;
  return { pie: newPie, bar: newBar };
}

/** Плагин: рисует легенду как HTML-теги (чипы) над графиком и скрывает стандартную легенду. */
const htmlLegendTagsPlugin: Plugin<'bar' | 'doughnut'> = {
  id: 'htmlLegendTags',
  afterUpdate(chart) {
    const legend = chart.legend;
    if (!legend?.legendItems?.length) return;
    const container = getOrCreateLegendContainer(chart);
    container.innerHTML = '';
    container.className = `${LEGEND_TAGS_CONTAINER} chart-legend-tags`;
    const chartType = (chart as { config?: { type?: string } }).config?.type;
    legend.legendItems.forEach((item: LegendItem) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const datasetIndex = (item as LegendItem & { datasetIndex?: number }).datasetIndex;
      const dataIndex = item.index;
      let hidden = item.hidden ?? false;
      if (chartType === 'doughnut' && dataIndex !== undefined) {
        const meta = chart.getDatasetMeta(0);
        const el = meta?.data?.[dataIndex] as { hidden?: boolean } | undefined;
        hidden = el?.hidden ?? false;
      } else if (datasetIndex !== undefined) {
        const meta = chart.getDatasetMeta(datasetIndex);
        hidden = meta?.hidden ?? false;
      }
      btn.className = 'chart-legend-tag' + (hidden ? ' chart-legend-tag--hidden' : '');
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-pressed', hidden ? 'false' : 'true');
      const dot = document.createElement('span');
      dot.className = 'chart-legend-tag__dot';
      dot.style.backgroundColor =
        typeof item.fillStyle === 'string' ? item.fillStyle : 'transparent';
      const textEl = document.createElement('span');
      textEl.className = 'chart-legend-tag__label';
      textEl.textContent = item.text ?? (item as { label?: string }).label ?? '';
      btn.appendChild(dot);
      btn.appendChild(textEl);
      btn.addEventListener('click', () => {
        if (chartType === 'doughnut' && dataIndex !== undefined) {
          const meta = chart.getDatasetMeta(0);
          const el = meta?.data?.[dataIndex] as { hidden?: boolean } | undefined;
          if (el) {
            el.hidden = !el.hidden;
            chart.update();
          }
        } else if (datasetIndex !== undefined) {
          const meta = chart.getDatasetMeta(datasetIndex);
          if (meta) {
            meta.hidden = !meta.hidden;
            chart.update();
          }
        }
      });
      container.appendChild(btn);
    });
  },
};

const DOUGHNUT_WRAP_CLASS = 'chart-card__doughnut-wrap';

const PIE_PERIOD_OPTIONS: { value: StatisticsPiePeriod; label: string }[] = [
  { value: 'current_month', label: 'charts.period.currentMonth' },
  { value: 'last_3', label: 'charts.period.last3Months' },
  { value: 'last_6', label: 'charts.period.last6Months' },
  { value: 'last_12', label: 'charts.period.last12Months' },
  { value: 'all', label: 'charts.period.allTime' },
];

function getOrCreateLegendContainer(chart: { canvas: HTMLCanvasElement }): HTMLElement {
  const directParent = chart.canvas.parentElement;
  if (!directParent) return document.createElement('div');
  // Для doughnut легенду вставляем в body перед обёрткой, чтобы график не пропадал
  const insertParent = directParent.classList?.contains(DOUGHNUT_WRAP_CLASS)
    ? (directParent.parentElement ?? directParent)
    : directParent;
  const insertBefore = directParent.classList?.contains(DOUGHNUT_WRAP_CLASS)
    ? directParent
    : chart.canvas;
  let el = insertParent?.querySelector<HTMLElement>(`.${LEGEND_TAGS_CONTAINER}`);
  if (!el && insertParent) {
    el = document.createElement('div');
    el.className = LEGEND_TAGS_CONTAINER;
    insertParent.insertBefore(el, insertBefore);
  }
  return el ?? document.createElement('div');
}

@Component({
  selector: 'category-analitics',
  templateUrl: './analitics.component.html',
  styleUrls: ['./analitics.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseChartDirective,
    ProgressSpinner,
    RoomMemberContributionsComponent,
    FormsModule,
    Select,
    TranslateModule,
  ],
})
export class CategoryAnaliticsComponent implements OnInit {
  private statisticsHttpService = inject(StatisticsHttpService);
  private statisticsRefreshService = inject(StatisticsRefreshService);
  private destroyRef = inject(DestroyRef);
  private currencyService = inject(CurrencyService);
  private exchangeRates = inject(ExchangeRatesService);
  private i18n = inject(I18nService);

  view = input<'row' | 'column'>('column');

  /** Показывать ли легенду в виде кликабельных тегов (только на странице статистики). */
  showLegendTags = input<boolean>(true);

  /** Если задан — обзор расходов по групповой комнате (вместо личного userId). */
  roomId = input<string | undefined>(undefined);

  /** Плагин для отображения легенды в виде тегов (для pie и bar). Всегда подключён; видимость тегов через CSS по классу .analytics--legend-tags. */
  /** Плагины для doughnut — отдельный массив с типом, чтобы не было TS2322 с bar. */
  chartPluginsDoughnut = [htmlLegendTagsPlugin] as Plugin<'doughnut'>[];
  /** Плагины для bar. */
  chartPluginsBar = [htmlLegendTagsPlugin] as Plugin<'bar'>[];

  /** Период агрегации для круговой диаграммы Categories share (по умолчанию — текущий календарный месяц). */
  piePeriod = signal<StatisticsPiePeriod>('current_month');

  readonly piePeriodOptions = computed(() => {
    this.i18n.currentLang();
    return PIE_PERIOD_OPTIONS.map((option) => ({
      value: option.value,
      label: this.i18n.t(option.label),
    }));
  });

  /** true пока запрос overview в процессе (показываем спиннер на всех трёх графиках). */
  overviewLoading = signal(true);

  pieData = signal<ChartConfiguration<'doughnut'>['data']>({ labels: [], datasets: [] });
  barData = signal<ChartConfiguration<'bar'>['data']>(EMPTY_BAR);
  lineData = signal<ChartConfiguration<'line'>['data']>(EMPTY_LINE);

  hasPieData = computed(() => hasChartData(this.pieData(), 'doughnut'));
  hasBarData = computed(() => hasChartData(this.barData(), 'bar'));
  hasLineData = computed(() => hasChartData(this.lineData(), 'line'));

  /** Pie data converted from BYN to current primary currency. */
  pieChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const raw = this.pieData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  /** Bar data converted from BYN to current primary currency. */
  barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const raw = this.barData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  /** Line data converted from BYN to current primary currency. */
  lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const raw = this.lineData();
    const target = this.currencyService.primaryCode();
    if (!raw?.datasets?.length) return raw;
    return {
      ...raw,
      datasets: raw.datasets.map((ds) => ({
        ...ds,
        data: (ds.data as number[]).map((v) =>
          this.exchangeRates.convert(typeof v === 'number' ? v : 0, 'BYN', target),
        ),
      })),
    };
  });

  private formatWithCurrency(v: number, currencyCode: string) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(v);
  }

  pieOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 4, bottom: 0, left: 0, right: 0 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.label}: ${this.formatWithCurrency(ctx.parsed as number, code)}`,
          },
        },
      },
      cutout: '60%',
      elements: {
        arc: {
          spacing: 4,
          borderRadius: 3,
          borderWidth: 2,
          borderColor: 'rgba(0, 0, 0, 0.4)',
        },
      },
    };
  });

  barOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4, right: 0, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y as number, code)}`,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 40,
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
            padding: 6,
            maxRotation: 45,
            autoSkip: true,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
            padding: 6,
          },
        },
      },
    };
  });

  lineOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const code = this.currencyService.primaryCode();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      layout: { padding: { top: 4, right: 0, left: 0, bottom: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(7, 17, 30, 0.96)',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: 600 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${this.formatWithCurrency(ctx.parsed.y ?? 0, code)}`,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.35,
        },
        point: {
          radius: 3,
          hoverRadius: 6,
          hitRadius: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
            padding: 6,
            maxRotation: 45,
            autoSkip: true,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
          ticks: {
            callback: (v) => this.formatWithCurrency(Number(v), code),
            color: 'rgba(255,255,255,0.7)',
            font: { size: 11 },
            padding: 6,
          },
        },
      },
    };
  });

  /** Запрос актуальных данных для графиков (вызывается при открытии и после изменений транзакций). */
  onPiePeriodModelChange(value: StatisticsPiePeriod): void {
    if (PIE_PERIOD_OPTIONS.some((o) => o.value === value)) {
      this.piePeriod.set(value);
    }
  }

  private loadOverview(): void {
    this.overviewLoading.set(true);
    const rid = this.roomId()?.trim();
    this.statisticsHttpService
      .getExpensesOverview({
        monthsBar: 6,
        locale: this.i18n.currentLang() === 'ru' ? 'ru' : 'en',
        piePeriod: this.piePeriod(),
        ...(rid ? { roomId: rid } : {}),
      })
      .subscribe({
        next: (res: ExpensesOverviewDto) => {
          const { pie, bar } = applySyncedColors(res.pie, res.bar);
          this.pieData.set(pie ?? { labels: [], datasets: [] });
          this.barData.set(bar ?? EMPTY_BAR);
          this.lineData.set(res.line ?? EMPTY_LINE);
          this.overviewLoading.set(false);
        },
        error: () => {
          this.pieData.set({ labels: [], datasets: [] });
          this.barData.set(EMPTY_BAR);
          this.lineData.set(EMPTY_LINE);
          this.overviewLoading.set(false);
        },
      });
  }

  constructor() {
    effect(() => {
      this.roomId();
      this.piePeriod();
      this.loadOverview();
    });
  }

  ngOnInit(): void {
    this.statisticsRefreshService.onRefresh
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadOverview());
  }
}

function hasChartData(
  data: ChartConfiguration<'doughnut' | 'bar' | 'line'>['data'] | undefined,
  _kind: 'doughnut' | 'bar' | 'line',
): boolean {
  if (!data?.datasets?.length) return false;
  const labels = data.labels as string[] | undefined;
  if (!labels?.length) return false;
  for (const ds of data.datasets) {
    const arr = ds.data as number[];
    if (arr?.some((v) => typeof v === 'number' && Number.isFinite(v) && v !== 0)) return true;
  }
  return false;
}
