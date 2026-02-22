import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TieredMenu, TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import {
  ExportReportService,
  type ExportData,
} from '@/shared/services/export/export-report.service';
import { MessageService } from 'primeng/api';

const CHART_IDS = ['budget', 'expenses', 'goals', 'category'] as const;
const CHART_RENDER_DELAY_MS = 1200;

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json' | 'html';

@Component({
  selector: 'export-report-button',
  templateUrl: './export-report.component.html',
  styleUrls: ['./export-report.component.scss'],
  standalone: true,
  imports: [ButtonModule, ProgressSpinnerModule, TieredMenuModule],
})
export class ExportReportComponent {
  @ViewChild(TieredMenu) menu!: TieredMenu;

  private router = inject(Router);
  private exportService = inject(ExportReportService);
  private messageService = inject(MessageService);

  readonly isLoading = signal(false);
  private readonly exportFormatWithCharts = signal<ExportFormat | null>(null);

  readonly showOverlay = computed(
    () =>
      this.isLoading() &&
      (this.exportFormatWithCharts() === 'pdf' || this.exportFormatWithCharts() === 'html'),
  );

  readonly menuItems: MenuItem[] = [
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.runExport('pdf') },
    { label: 'CSV', icon: 'pi pi-file', command: () => this.runExport('csv') },
    { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.runExport('excel') },
    { label: 'JSON', icon: 'pi pi-code', command: () => this.runExport('json') },
    { label: 'HTML', icon: 'pi pi-file-edit', command: () => this.runExport('html') },
  ];

  readonly buttonLabel = computed(() => (this.isLoading() ? 'Export…' : 'Export report'));

  openMenu(event: Event) {
    this.menu.toggle(event);
  }

  runExport(format: ExportFormat) {
    this.isLoading.set(true);
    this.exportFormatWithCharts.set(format === 'pdf' || format === 'html' ? format : null);

    const run = () => {
      this.exportInBackground(format).finally(() => {
        this.isLoading.set(false);
        this.exportFormatWithCharts.set(null);
      });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => run(), { timeout: 300 });
    } else {
      setTimeout(run, 0);
    }
  }

  private async exportInBackground(format: ExportFormat): Promise<void> {
    await yieldToMain();
    const data = await this.exportService.getExportData();
    if (!data) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Access denied',
        detail: 'Sign in to export',
        life: 3000,
      });
      return;
    }
    await yieldToMain();

    try {
      if (format === 'pdf') {
        const chartUrls = await this.captureCharts();
        await yieldToMain();
        await this.exportPDFInWorker(data, chartUrls);
      } else if (format === 'html') {
        const chartUrls = await this.captureCharts();
        await yieldToMain();
        this.exportService.exportHTML(data, chartUrls);
      } else if (format === 'csv') {
        await yieldToMain();
        this.exportService.exportCSV(data);
      } else if (format === 'excel') {
        await yieldToMain();
        this.exportService.exportExcel(data);
      } else if (format === 'json') {
        await yieldToMain();
        this.exportService.exportJSON(data);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Export ready',
        detail: 'File saved',
        life: 2000,
      });
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate report',
        life: 4000,
      });
    }
  }

  private async captureCharts(): Promise<string[]> {
    const isOnStatistics = this.router.url.includes('statistics');
    if (!isOnStatistics) {
      await this.router.navigate(['/statistics']);
      await this.waitForChartsReady();
    } else {
      await this.waitForChartsReady();
    }
    await yieldToMain();

    const urls: string[] = [];
    for (const id of CHART_IDS) {
      await yieldToMain();
      const el = document.getElementById(id);
      if (!el) continue;
      try {
        const dataUrl = this.getChartImageFromCanvas(el);
        if (dataUrl) {
          urls.push(dataUrl);
          continue;
        }
        const canvas = await html2canvas(el, { scale: 1, useCORS: true, logging: false });
        urls.push(canvas.toDataURL('image/png'));
      } catch {
        // skip
      }
    }
    return urls;
  }

  /** Ждём появления хотя бы одного графика (canvas в контейнерах) после перехода на статистику. */
  private async waitForChartsReady(): Promise<void> {
    const maxWait = 8000;
    const step = 200;
    const hasChart = () =>
      CHART_IDS.some((id) => document.getElementById(id)?.querySelector('canvas'));
    for (let elapsed = 0; elapsed < maxWait; elapsed += step) {
      await this.delay(step);
      if (hasChart()) return;
    }
    await this.delay(CHART_RENDER_DELAY_MS);
  }

  /** Берёт изображение с canvas (Chart.js), подкладывая фон — иначе в PDF прозрачность даёт белый. */
  private getChartImageFromCanvas(container: HTMLElement): string | null {
    const canvas = container.querySelector('canvas');
    if (!canvas || canvas.width < 10 || canvas.height < 10) return null;
    try {
      let bg =
        getComputedStyle(container).backgroundColor ||
        getComputedStyle(container.parentElement ?? container).backgroundColor ||
        '';
      if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '#1e293b';
      const off = document.createElement('canvas');
      off.width = canvas.width;
      off.height = canvas.height;
      const ctx = off.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, off.width, off.height);
      ctx.drawImage(canvas, 0, 0);
      return off.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private exportPDFInWorker(data: ExportData, chartUrls: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const workerUrl = new URL('../../../shared/workers/export-pdf.worker', import.meta.url);
      const worker = new Worker(workerUrl, { type: 'module' });
      worker.onmessage = (e: MessageEvent<{ arrayBuffer?: ArrayBuffer; error?: string }>) => {
        worker.terminate();
        if (e.data.error) {
          this.exportService.exportPDF(data, chartUrls).then(resolve).catch(reject);
          return;
        }
        if (e.data.arrayBuffer) {
          const blob = new Blob([e.data.arrayBuffer], { type: 'application/pdf' });
          this.exportService.downloadBlob(blob, this.exportService.getReportFilename('pdf'));
          resolve();
        } else {
          reject(new Error('Invalid worker response'));
        }
      };
      worker.onerror = () => {
        worker.terminate();
        this.exportService.exportPDF(data, chartUrls).then(resolve).catch(reject);
      };
      yieldToMain().then(() => {
        const docDefinition = this.exportService.buildPDFDocDefinition(data, chartUrls);
        worker.postMessage({ docDefinition });
      });
    });
  }
}
