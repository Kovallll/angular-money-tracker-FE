import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalancesHttpService } from '@/shared';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    MessageModule,
    Select,
    InputNumber,
    FloatLabel,
  ],
  providers: [MessageService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardModalComponent {
  messageService = inject(MessageService);
  private balancesHttpService = inject(BalancesHttpService);

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
      console.log(this.card, 'card');
      this.balancesHttpService.createCard(this.card).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Card created successfully',
            life: 3000,
          });
          form.resetForm();
        },
        error: (err) => {
          this.messageService.add({
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
