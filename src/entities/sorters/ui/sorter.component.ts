import { Component, input, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatDialog } from '@angular/material/dialog';
import { SorterModalComponent } from './modal/sorter-modal.component';
import { DialogData, SortersField } from '../lib';
import { SorterService } from '../services/sorter.service';

@Component({
  selector: 'sorters',
  templateUrl: './sorter.component.html',
  styleUrls: ['./sorter.component.scss'],
  imports: [MatIconModule],
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
    });
  }
}
