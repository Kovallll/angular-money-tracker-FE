import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { AddCardModalComponent } from './modal/add-card-modal.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'balance-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, DynamicDialogModule, AppIconComponent],
  providers: [DialogService],
})
export class BalanceAddCardButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(AddCardModalComponent, {
      header: 'Add Card',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal add-card-modal',
      width: '660px',
    });
  }
}
