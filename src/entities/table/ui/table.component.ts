import { CommonModule } from '@angular/common';
import { Component, computed, Input, input, output, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TableCell } from '../lib';
import { ContextMenuComponent } from '@/entities/context-menu/cm.component';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [CommonModule, MatTableModule, ContextMenuComponent],
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
}
