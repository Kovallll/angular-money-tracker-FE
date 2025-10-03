import { CommonModule } from '@angular/common';
import { Component, computed, Input, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TableCell } from '../lib';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [CommonModule, MatTableModule],
  standalone: true,
})
export class TableComponent {
  dataSource = input.required<any[]>();
  @Input() isEmpty = false;
  displayedCells = input.required<TableCell[]>();

  displayedColumns = computed(() => this.displayedCells().map((cell) => cell.field));
}
