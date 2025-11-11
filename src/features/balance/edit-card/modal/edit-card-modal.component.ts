import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
  Signal,
  OnInit,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalanceCard, BalancesHttpService, CreateCard } from '@/shared';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabel } from 'primeng/floatlabel';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { QueryClient } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'update-card-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
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
export class UpdateCardModalComponent implements OnInit {
  messageService = inject(MessageService);
  private balancesHttpService = inject(BalancesHttpService);
  private ref = inject(DynamicDialogRef);
  private route = inject(ActivatedRoute);

  id: number | null = null;
  card = signal<CreateCard>({
    bankName: '',
    cardType: '',
    cardBalance: 0,
    branchName: '',
    cardNumber: '',
    cardName: '',
  });

  onSubmit(form: NgForm) {
    if (form.valid && this.card?.() && this.id) {
      this.balancesHttpService.updateCard(this.id, this.card()!).subscribe({
        next: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Card updated successfully',
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
            detail: 'Failed to update card',
            life: 3000,
          });
        },
      });
    }
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id = id;
    this.balancesHttpService.getCard(id).subscribe((card) => {
      this.card.set({
        bankName: card.bankName,
        cardType: card.cardType,
        cardBalance: card.cardBalance,
        branchName: card.branchName,
        cardNumber: card.cardNumber,
        cardName: card.cardName,
      });
    });
  }
}
