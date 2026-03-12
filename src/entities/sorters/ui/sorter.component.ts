import { Component, input, computed, inject } from '@angular/core';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

import { MatDialog } from '@angular/material/dialog';
import { SorterModalComponent } from './modal/sorter-modal.component';
import { DialogData, SortersField } from '../lib';
import { SorterService } from '../services/sorter.service';

@Component({
  selector: 'sorters',
  templateUrl: './sorter.component.html',
  styleUrls: ['./sorter.component.scss'],
  imports: [AppIconComponent],
  standalone: true,
})
export class SorterComponent {
  readonly dialog = inject(MatDialog);

  sortersFields = input.required<SortersField[]>();

  categoryOptions = computed(() => this.sorterService.getCategoryOptions(this.sortersFields()));

  constructor(private sorterService: SorterService) {}

  openDialog() {
    this.dialog.open(SorterModalComponent, {
      data: {
        categoryOptions: this.categoryOptions,
      } as DialogData,
      panelClass: 'sorter-modal',
      width: '400px',
      maxWidth: 'calc(100vw - 24px)',
    });
  }
}
