import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, output, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TableCell } from '../lib';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';
import { AppCurrencyPipe } from '@/shared/pipes/app-currency.pipe';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [CommonModule, MatTableModule, ContextMenuComponent, AppCurrencyPipe, AppIconComponent],
  standalone: true,
})
export class TableComponent<T> {
  @ViewChild('ctxMenu') ctxMenu!: ContextMenuComponent;
  dataSource = input.required<any[]>();
  @Input() isEmpty = false;
  displayedCells = input.required<TableCell[]>();

  displayedColumns = computed(() => this.displayedCells().map((cell) => cell.field));

  onDelete = output<T>();
  onEdit = output<T>();
  selectedRow: any = null;
  handleDelete(row: T) {
    this.onDelete.emit(row);
  }

  handleEdit(row: T) {
    this.onEdit.emit(row);
  }

  openContextMenu(event: MouseEvent, row: any) {
    event.preventDefault();
    this.selectedRow = row;
    this.ctxMenu.open(event);
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
