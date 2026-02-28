import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionModalComponent } from './modal/add-card-modal.component';

@Component({
  standalone: true,
  selector: 'transaction-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent],
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
      width: '560px',
    });
  }
}
