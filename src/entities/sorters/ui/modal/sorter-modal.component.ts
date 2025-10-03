import { ModalComponent } from '@/entities/cards/modal/modal.component';
import { SelectComponent } from '@/entities/select/ui/select.component';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { defaultSorter, DialogData, Sorter } from '../../lib';
import { MatIconModule } from '@angular/material/icon';
import { SorterService } from '../../services/sorter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sorters-modal',
  templateUrl: './sorter-modal.component.html',
  styleUrls: ['./sorter-modal.component.scss'],
  imports: [SelectComponent, ModalComponent, MatIconModule],
  standalone: true,
})
export class SorterModalComponent implements OnInit {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  public readonly sorter = signal<Sorter>(defaultSorter);
  private readonly route = inject(ActivatedRoute);

  constructor(
    private dialogRef: MatDialogRef<SorterModalComponent>,
    private sorterService: SorterService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const sorter = this.sorterService.updateSorterFromUrlParams(params);
      this.sorter.set(sorter);
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  clearSorter() {
    this.sorterService.clearSorter();
    this.dialogRef.close();
  }

  applySorter() {
    this.sorterService.applySorter();
    this.dialogRef.close();
  }

  isAscending() {
    return this.sorter().order === 'asc';
  }

  onChangeOrder(isAscending: boolean) {
    this.sorterService.setSorter({ ...this.sorter(), order: isAscending ? 'asc' : 'desc' });
    this.sorter.set(this.sorterService.getSorter());
  }

  onCategoryChange(value: string) {
    this.sorterService.setSorter({ ...this.sorter(), field: value });
    this.sorter.set(this.sorterService.getSorter());
  }
}
