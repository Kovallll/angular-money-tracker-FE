import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionModalComponent } from './modal/add-card-modal.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'transaction-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, AppIconComponent],
  providers: [DialogService],
})
export class TransactionAddButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  groupRoomId = input<string | undefined>(undefined);

  constructor(public dialogService: DialogService) {}

  show() {
    const rid = this.groupRoomId()?.trim();
    this.ref = this.dialogService.open(AddTransactionModalComponent, {
      header: 'Add Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      width: '560px',
      data: rid ? { groupRoomId: rid } : undefined,
      focusOnShow: false,
    });
  }
}
