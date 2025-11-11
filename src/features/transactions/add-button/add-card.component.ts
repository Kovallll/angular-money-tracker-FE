import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionModalComponent } from './modal/add-card-modal.component';

@Component({
  standalone: true,
  selector: 'transaction-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  providers: [DialogService],
})
export class TransactionAddButtonComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(AddTransactionModalComponent, {
      header: 'Add Transaction',
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
    });
  }
}
