import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UpdateCardModalComponent } from './modal/edit-card-modal.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'balance-update-card-button',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ButtonModule, DynamicDialogModule],
  providers: [DialogService],
})
export class BalanceEditCardButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(UpdateCardModalComponent, {
      header: 'Edit Card',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
    });
  }
}
