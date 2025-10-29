import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddCategoryModalComponent } from './modal/add-card-modal.component';

@Component({
  standalone: true,
  selector: 'category-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  providers: [DialogService],
})
export class GategoryAddButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(AddCategoryModalComponent, {
      header: 'Add Card',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
    });
  }
}
