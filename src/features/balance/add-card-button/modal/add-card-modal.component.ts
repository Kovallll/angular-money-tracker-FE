import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule, ToastModule, MessageModule],
  providers: [MessageService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardModalComponent {
  messageService = inject(MessageService);

  card = {
    bankName: '',
    accountType: '',
    balance: '',
    branchName: '',
    accountNumber: '',
  };

  onSubmit(form: any) {
    if (form.valid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form Submitted',
        life: 3000,
      });
      form.resetForm();
    }
  }
}
