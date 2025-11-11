import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'export-report-button',
  templateUrl: './export-report.component.html',
  styleUrls: ['./export-report.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class ExportReportComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = false;
  async exportChartToPDF(ids: string[]) {
    this.isLoading = true;
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (!el) continue;

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save('charts.pdf');
    this.isLoading = false;
  }
  async download() {
    if (!this.router.url.includes('statistics')) {
      await this.router.navigate(['statistics'], { relativeTo: this.route });
    }
    this.exportChartToPDF(['budget', 'expenses', 'category', 'goals']);
  }
}
