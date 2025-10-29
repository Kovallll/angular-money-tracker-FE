import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalancesHttpService } from '@/shared';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    Select,
    InputNumber,
    FloatLabel,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardModalComponent {
  messageService = inject(MessageService);
  private balancesHttpService = inject(BalancesHttpService);
  private ref = inject(DynamicDialogRef);

  card = {
    bankName: '',
    cardType: '',
    cardBalance: 0,
    branchName: '',
    cardNumber: '',
    cardName: '',
  };

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.balancesHttpService.createCard(this.card).subscribe({
        next: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Card created successfully',
            life: 3000,
          });
          form.resetForm();
          this.ref.close();
        },
        error: (err) => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create card',
            life: 3000,
          });
        },
      });
    }
  }
}
