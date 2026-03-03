import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalancesHttpService, CreateCard } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { Select } from 'primeng/select';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'update-card-modal',
  templateUrl: './edit-card-modal.component.html',
  styleUrls: ['./edit-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    Select,
    PriceCurrencyFieldComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateCardModalComponent implements OnInit {
  messageService = inject(MessageService);
  private balancesHttpService = inject(BalancesHttpService);
  private ref = inject(DynamicDialogRef);
  private route = inject(ActivatedRoute);
  readonly currencyService = inject(CurrencyService);

  id: number | null = null;
  card = signal<CreateCard>({
    bankName: '',
    cardType: '',
    cardBalance: 0,
    cardNumber: '',
    cardName: '',
    currencyCode: undefined,
    expiry: undefined,
  });

  setCardCurrency(code: string) {
    this.card.update((c) => ({ ...c, currencyCode: code }));
  }

  get cardBalance(): number {
    return this.card().cardBalance ?? 0;
  }
  set cardBalance(v: number) {
    this.card.update((c) => ({ ...c, cardBalance: v }));
  }

  get currencyCode(): string {
    return this.card().currencyCode ?? this.currencyService.primaryCode();
  }
  set currencyCode(v: string) {
    this.setCardCurrency(v);
  }

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

  formatExpiry(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const formatted =
      digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits || undefined;
    this.card.update((c) => ({ ...c, expiry: formatted }));
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id = id;
    this.balancesHttpService.getCard(id).subscribe((card) => {
      this.card.set({
        bankName: card.bankName,
        cardType: card.cardType,
        cardBalance: card.cardBalance,
        cardNumber: card.cardNumber,
        cardName: card.cardName,
        currencyCode: card.currencyCode ?? this.currencyService.primaryCode(),
        expiry: card.expiry ?? undefined,
      });
    });
  }

  close(): void {
    this.ref.close();
  }
}
