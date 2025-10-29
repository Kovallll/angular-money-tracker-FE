import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AddCardModalComponent } from './modal/add-card-modal.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'balance-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ButtonModule, DynamicDialogModule],
  providers: [DialogService],
})
export class BalanceAddCardButtonComponent implements OnDestroy {
  ref: DynamicDialogRef | undefined | null;

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(AddCardModalComponent, {
      header: 'Add Card',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
    });
  }

  onClose() {
    this.ref?.close();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
