import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, output, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';
import { TableCell } from '../lib';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { RowMenuButtonComponent } from '@/shared/components/row-menu-button/row-menu-button.component';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatTooltipModule,
    ContextMenuComponent,
    AppCurrencyPipe,
    AppIconComponent,
    RowMenuButtonComponent,
  ],
  standalone: true,
})
export class TableComponent<T> {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;
  dataSource = input.required<any[]>();
  @Input() isEmpty = false;
  displayedCells = input.required<TableCell[]>();

  displayedColumns = computed(() => [
    ...this.displayedCells().map((cell) => cell.field),
    'actions',
  ]);

  onDelete = output<T>();
  onEdit = output<T>();
  selectedRow: any = null;
  handleDelete(row: T) {
    this.onDelete.emit(row);
  }

  handleEdit(row: T) {
    this.onEdit.emit(row);
  }

  openRowMenu(event: Event, row: any) {
    event.stopPropagation();
    this.selectedRow = row;
    this.ctxMenu.toggle(event);
  }

  rowDescription(row: Record<string, unknown>): string {
    const d = row['description'];
    return typeof d === 'string' ? d.trim() : '';
  }

  onDataRowClick(event: MouseEvent, row: Record<string, unknown>, tip: MatTooltip): void {
    const text = this.rowDescription(row);
    if (!text) return;
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    event.preventDefault();
    tip.show();
    window.setTimeout(() => tip.hide(), 5000);
  }

  /** Значение ячейки для проверки на пустоту (null, undefined, ''). */
  cellValue(row: Record<string, unknown>, field: string): unknown {
    const v = row[field];
    if (v == null || v === '') return v;
    if (typeof v === 'object' && v !== null && 'title' in v)
      return (v as { title?: string }).title ?? '';
    return v;
  }

  /** Значение для отображения (для объекта с title — показываем title). */
  cellDisplayValue(row: Record<string, unknown>, field: string): string {
    const v = row[field];
    if (v == null || v === '') return '';
    if (typeof v === 'object' && v !== null && 'title' in v)
      return String((v as { title?: string }).title ?? '');
    return String(v);
  }
}
