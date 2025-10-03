import { Component, input, signal, computed, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatDialog } from '@angular/material/dialog';
import { FiltersModalComponent } from './modal/filters-modal.component';
import { DialogData, FilterData, FiltersField } from '../lib';
import { FiltersService } from '../services/filters.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [MatIconModule],
  standalone: true,
})
export class FiltersComponent {
  readonly dialog = inject(MatDialog);

  data = input.required<FilterData[]>();
  filterFields = input.required<FiltersField[]>();

  categoryOptions = computed(() => this.filterService.getCategoryOptions(this.filterFields()));

  constructor(private filterService: FiltersService) {}

  openDialog() {
    this.dialog.open(FiltersModalComponent, {
      data: {
        categoryOptions: this.categoryOptions,
        filterFields: this.filterFields,
        data: this.data,
      } as DialogData,
      panelClass: 'filter-modal',
    });
  }
}
