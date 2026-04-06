import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddCategoryModalComponent } from './modal/add-card-modal.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'category-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, AppIconComponent],
  providers: [DialogService],
})
export class GategoryAddButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  /** Если задан — категория создаётся в групповой комнате. */
  groupRoomId = input<string | undefined>(undefined);

  constructor(public dialogService: DialogService) {}

  show() {
    const rid = this.groupRoomId()?.trim();
    this.ref = this.dialogService.open(AddCategoryModalComponent, {
      header: 'Add Category',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      data: rid ? { groupRoomId: rid } : undefined,
      focusOnShow: false,
    });
  }
}
