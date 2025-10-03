import { ModalComponent } from '@/entities/cards/modal/modal.component';
import { SelectComponent } from '@/entities/select/ui/select.component';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { defaultFilters, DialogData, Filter } from '../../lib';
import { FiltersService } from '../../services/filters.service';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'filters-modal',
  templateUrl: './filters-modal.component.html',
  styleUrls: ['./filters-modal.component.scss'],
  imports: [SelectComponent, ModalComponent, MatIconModule],
  standalone: true,
})
export class FiltersModalComponent implements OnInit {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  public readonly filters = signal<Filter[]>(defaultFilters);
  private route = inject(ActivatedRoute);

  constructor(
    private dialogRef: MatDialogRef<FiltersModalComponent>,
    private filtersService: FiltersService,
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }

  applyChanges(): void {
    this.filtersService.applyFilters();
    this.dialogRef.close();
  }

  addFilter() {
    this.filtersService.addFilter();
    this.filters.set(this.filtersService.getFilters());
  }

  removeFilter(index: number) {
    this.filtersService.removeFilter(index);
    this.filters.set(this.filtersService.getFilters());
  }

  onCategoryChange(value: string, index: number) {
    console.log(value, index);
    this.filtersService.setFilterCategory(value, index);
    this.filters.set(this.filtersService.getFilters());
    this.filtersService.setValueOptions(value, this.data.data(), index);
  }

  onValueChange(value: string, index: number) {
    this.filtersService.setFilterValue(value, index);
    this.filters.set(this.filtersService.getFilters());
  }

  clearFilters() {
    this.filtersService.clearFilters();
    this.filters.set(this.filtersService.getFilters());
    this.dialogRef.close();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const paramsFilters = this.filtersService.updateFiltersFormUrlParams(
        this.data.data(),
        params,
      );
      console.log(paramsFilters, 'paramsFilters');
      this.filters.set(paramsFilters);
    });

    console.log(this.filters(), 'this.filters');
  }
}
