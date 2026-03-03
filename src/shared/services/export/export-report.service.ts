import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@/shared/services/auth/auth.service';
import {
  balancesUrl,
  transactionsUrl,
  goalsUrl,
  subscriptionsUrl,
  categoriesUrl,
} from '@/shared/constants';
import type {
  BalanceCard,
  Transaction,
  GoalItem,
  SubscribeItem,
  CategoryItem,
} from '@/shared/types';
import { lastValueFrom } from 'rxjs';

export interface ExportData {
  cards: BalanceCard[];
  transactions: Transaction[];
  goals: GoalItem[];
  subscriptions: SubscribeItem[];
  categories: CategoryItem[];
  exportedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExportReportService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  async getExportData(): Promise<ExportData | null> {
    const userId = this.auth.getCurrentUserId();
    if (!userId) return null;

    const [cards, transactions, goals, subscriptions, categories] = await Promise.all([
      lastValueFrom(this.http.get<BalanceCard[]>(`${balancesUrl}/user/${userId}`)).catch(() => []),
      lastValueFrom(this.http.get<Transaction[]>(`${transactionsUrl}/user/${userId}`)).catch(
        () => [],
      ),
      lastValueFrom(this.http.get<GoalItem[]>(`${goalsUrl}/user/${userId}`)).catch(() => []),
      lastValueFrom(this.http.get<SubscribeItem[]>(`${subscriptionsUrl}/user/${userId}`)).catch(
        () => [],
      ),
      lastValueFrom(this.http.get<CategoryItem[]>(`${categoriesUrl}/user/${userId}`)).catch(
        () => [],
      ),
    ]);

    return {
      cards,
      transactions,
      goals,
      subscriptions,
      categories,
      exportedAt: new Date().toISOString(),
    };
  }

  downloadBlob(blob: Blob, filename: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  getReportFilename(ext: string): string {
    return `report_${dateSuffix()}.${ext}`;
  }

  /** Собирает определение PDF для передачи в воркер или вызова pdfMake на главном потоке. */
  buildPDFDocDefinition(
    data: ExportData,
    chartImageDataUrls: string[] = [],
  ): Record<string, unknown> {
    const fmt = (n: number) => (n ?? 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    const content: Array<Record<string, unknown>> = [];

    content.push(
      { text: 'Financial Report', style: 'header' },
      {
        text: `Exported: ${new Date(data.exportedAt).toLocaleString('en-US')}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
    );

    const contentWidth = 515;
    const chartHeight = 220;
    for (const imgData of chartImageDataUrls) {
      content.push({
        image: imgData,
        width: contentWidth,
        height: chartHeight,
        margin: [0, 0, 0, 10],
      });
    }

    const section = (title: string, hasData: boolean, tableOrNoData: Record<string, unknown>) => {
      content.push({ text: title, style: 'sectionHeader', margin: [0, 10, 0, 6] });
      if (hasData) content.push(tableOrNoData);
      else content.push({ text: 'No data', margin: [0, 0, 0, 12] });
    };

    section('Cards (balances)', data.cards.length > 0, {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Name', 'Bank', 'Type', 'Number', 'Balance'],
          ...data.cards.map((c) => [
            c.cardName,
            c.bankName,
            c.cardType,
            c.cardNumber,
            fmt(c.cardBalance),
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12],
    });

    section('Transactions (recent)', data.transactions.length > 0, {
      table: {
        headerRows: 1,
        widths: [60, '*', 'auto', 70, 'auto'],
        body: [
          ['Date', 'Title', 'Category', 'Amount', 'Type'],
          ...data.transactions
            .slice(0, 50)
            .map((t) => [t.date, t.title, t.category, String(t.amount), t.type]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12],
    });

    section('Goals', data.goals.length > 0, {
      table: {
        headerRows: 1,
        widths: ['*', 80, 80, 80, 80],
        body: [
          ['Title', 'Target', 'Current', 'Start', 'End'],
          ...data.goals.map((g) => [
            g.title,
            fmt(g.targetBudget),
            fmt(g.goalBudget),
            g.startDate,
            g.endDate || '—',
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12],
    });

    section('Subscriptions', data.subscriptions.length > 0, {
      table: {
        headerRows: 1,
        widths: ['*', 70, 80, 80, 'auto'],
        body: [
          ['Name', 'Amount', 'Date', 'Last charge', 'Type'],
          ...data.subscriptions.map((s) => [
            s.subscribeName,
            fmt(s.amount),
            s.subscribeDate,
            s.lastCharge,
            s.type,
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12],
    });

    section('Categories', data.categories.length > 0, {
      table: {
        headerRows: 1,
        widths: ['*', 80, 80],
        body: [
          ['Title', 'Expenses', 'Income'],
          ...data.categories.map((c) => [c.title, fmt(c.totalExpenses), fmt(c.totalRevenues)]),
        ],
      },
      layout: 'lightHorizontalLines',
    });

    return {
      content,
      pageMargins: [40, 40, 40, 40],
      defaultStyle: { font: 'Roboto' },
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 4] },
        subheader: { fontSize: 11, color: '#64748b' },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 6] },
      },
    };
  }

  /** PDF на главном потоке (fallback, если воркер недоступен). */
  async exportPDF(data: ExportData, chartImageDataUrls: string[] = []): Promise<void> {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const vfsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;
    const vfs = (vfsModule as { pdfMake?: { vfs: Record<string, string> } }).pdfMake?.vfs;
    if (vfs && typeof pdfMake.vfs === 'undefined') pdfMake.vfs = vfs;
    const doc = this.buildPDFDocDefinition(data, chartImageDataUrls);
    pdfMake.createPdf(doc).download(`report_${dateSuffix()}.pdf`);
  }

  exportCSV(data: ExportData): void {
    const sep = ';';
    const enc = '\uFEFF';
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      if (/[;"\n,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const sections: string[] = [];
    sections.push('Cards (Balances)');
    sections.push(['Name', 'Bank', 'Type', 'Number', 'Balance'].join(sep));
    data.cards.forEach((c) =>
      sections.push(
        [c.cardName, c.bankName, c.cardType, c.cardNumber, c.cardBalance].map(escape).join(sep),
      ),
    );
    sections.push('');
    sections.push('Transactions');
    sections.push(['Date', 'Title', 'Category', 'Amount', 'Type'].join(sep));
    data.transactions.forEach((t) =>
      sections.push([t.date, t.title, t.category, t.amount, t.type].map(escape).join(sep)),
    );
    sections.push('');
    sections.push('Goals');
    sections.push(['Title', 'Target budget', 'Current', 'Start', 'End'].join(sep));
    data.goals.forEach((g) =>
      sections.push(
        [g.title, g.targetBudget, g.goalBudget, g.startDate, g.endDate || '—']
          .map(escape)
          .join(sep),
      ),
    );
    sections.push('');
    sections.push('Subscriptions');
    sections.push(['Name', 'Amount', 'Date', 'Last charge', 'Type'].join(sep));
    data.subscriptions.forEach((s) =>
      sections.push(
        [s.subscribeName, s.amount, s.subscribeDate, s.lastCharge, s.type].map(escape).join(sep),
      ),
    );
    sections.push('');
    sections.push('Categories');
    sections.push(['Title', 'Expenses', 'Income'].join(sep));
    data.categories.forEach((c) =>
      sections.push([c.title, c.totalExpenses, c.totalRevenues].map(escape).join(sep)),
    );
    const csv = enc + sections.join('\r\n');
    this.downloadBlob(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      `report_${dateSuffix()}.csv`,
    );
  }

  exportJSON(data: ExportData): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadBlob(
      new Blob([json], { type: 'application/json' }),
      `report_${dateSuffix()}.json`,
    );
  }

  exportExcel(data: ExportData): void {
    this.exportCSV(data);
  }

  exportHTML(data: ExportData, chartImagesBase64: string[] = []): void {
    const fmt = (n: number) => (n ?? 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    const h = (tag: string, content: string, attrs = '') =>
      `<${tag}${attrs ? ' ' + attrs : ''}>${content}</${tag}>`;
    const esc = (s: string) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: #0f172a; color: #e2e8f0; line-height: 1.5; }
  h1 { font-size: 1.75rem; margin-bottom: 8px; color: #fff; }
  h2 { font-size: 1.25rem; margin: 24px 0 12px; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 6px; }
  .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #334155; }
  th { color: #94a3b8; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  tr:hover { background: rgba(255,255,255,0.04); }
  .charts-row { display: flex; flex-direction: column; gap: 16px; margin: 16px 0; }
  .chart-img { width: 100%; max-width: 100%; height: auto; max-height: 320px; object-fit: contain; border-radius: 8px; border: 1px solid #334155; }
.no-data { margin: 8px 0 16px; color: #64748b; }
</style></head><body>`;

    html += h('h1', 'Financial Report');
    html += h(
      'p',
      `Exported: ${new Date(data.exportedAt).toLocaleString('en-US')}`,
      'class="meta"',
    );
    html += '<div class="charts-row">';
    chartImagesBase64.forEach((src) => {
      html += `<img class="chart-img" src="${src}" alt="Chart" />`;
    });
    html += '</div>';

    const sectionHtml = (title: string, hasData: boolean, tableRows: string) => {
      html += h('h2', title);
      if (hasData) html += tableRows;
      else html += '<p class="no-data">No data</p>';
    };

    sectionHtml(
      'Cards (balances)',
      data.cards.length > 0,
      '<table><thead><tr><th>Name</th><th>Bank</th><th>Type</th><th>Number</th><th>Balance</th></tr></thead><tbody>' +
        data.cards
          .map(
            (c) =>
              `<tr><td>${esc(c.cardName)}</td><td>${esc(c.bankName)}</td><td>${esc(c.cardType)}</td><td>${esc(c.cardNumber)}</td><td>${fmt(c.cardBalance)}</td></tr>`,
          )
          .join('') +
        '</tbody></table>',
    );

    const transRows = data.transactions
      .slice(0, 500)
      .map(
        (t) =>
          `<tr><td>${esc(t.date)}</td><td>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${fmt(t.amount)}</td><td>${esc(t.type)}</td></tr>`,
      )
      .join('');
    const transExtra =
      data.transactions.length > 500
        ? `<tr><td colspan="5">… and ${data.transactions.length - 500} more</td></tr>`
        : '';
    sectionHtml(
      'Transactions',
      data.transactions.length > 0,
      '<table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Amount</th><th>Type</th></tr></thead><tbody>' +
        transRows +
        transExtra +
        '</tbody></table>',
    );

    sectionHtml(
      'Goals',
      data.goals.length > 0,
      '<table><thead><tr><th>Title</th><th>Target budget</th><th>Current</th><th>Period</th></tr></thead><tbody>' +
        data.goals
          .map(
            (g) =>
              `<tr><td>${esc(g.title)}</td><td>${fmt(g.targetBudget)}</td><td>${fmt(g.goalBudget)}</td><td>${esc(g.startDate)} – ${esc(g.endDate || '—')}</td></tr>`,
          )
          .join('') +
        '</tbody></table>',
    );

    sectionHtml(
      'Subscriptions',
      data.subscriptions.length > 0,
      '<table><thead><tr><th>Name</th><th>Amount</th><th>Date / Last charge</th><th>Type</th></tr></thead><tbody>' +
        data.subscriptions
          .map(
            (s) =>
              `<tr><td>${esc(s.subscribeName)}</td><td>${fmt(s.amount)}</td><td>${esc(s.subscribeDate)} / ${esc(s.lastCharge ?? '—')}</td><td>${esc(s.type)}</td></tr>`,
          )
          .join('') +
        '</tbody></table>',
    );

    sectionHtml(
      'Categories',
      data.categories.length > 0,
      '<table><thead><tr><th>Title</th><th>Expenses</th><th>Income</th></tr></thead><tbody>' +
        data.categories
          .map(
            (c) =>
              `<tr><td>${esc(c.title)}</td><td>${fmt(c.totalExpenses)}</td><td>${fmt(c.totalRevenues)}</td></tr>`,
          )
          .join('') +
        '</tbody></table>',
    );

    html += '</body></html>';

    this.downloadBlob(
      new Blob([html], { type: 'text/html;charset=utf-8' }),
      `report_${dateSuffix()}.html`,
    );
  }
}

function dateSuffix() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}
