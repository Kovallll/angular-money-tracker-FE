import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalancesHttpService, CreateCard } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { Select } from 'primeng/select';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';

const CARD_NUMBER_DIGITS = 16;

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
    PriceCurrencyFieldComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardModalComponent implements OnInit {
  protected readonly messageService = inject(MessageService);
  private readonly balancesHttpService = inject(BalancesHttpService);
  private readonly ref = inject(DynamicDialogRef);
  protected readonly currencyService = inject(CurrencyService);

  protected card: CreateCard = {
    bankName: '',
    cardType: '',
    cardBalance: 0,
    branchName: '',
    cardNumber: '',
    cardName: '',
    currencyCode: undefined,
  };

  protected readonly cardTypeOptions = [
    { label: 'Credit', value: 'credit' },
    { label: 'Debit', value: 'debit' },
    { label: 'Prepaid', value: 'prepaid' },
  ];

  protected readonly paymentOptions = [
    { label: 'MasterCard', value: 'MasterCard' },
    { label: 'Visa', value: 'Visa' },
  ];

  ngOnInit(): void {
    if (!this.card.currencyCode) {
      this.card.currencyCode = this.currencyService.primaryCode();
    }
  }

  protected formatCardNumber(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, CARD_NUMBER_DIGITS);
    this.card.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  protected isCardNumberInvalid(control: NgModel | string | undefined): boolean {
    const value =
      control == null
        ? undefined
        : typeof control === 'string'
          ? control
          : (control as NgModel).value;
    if (value == null || value === '') return true;
    const digits = String(value).replace(/\D/g, '');
    return digits.length !== CARD_NUMBER_DIGITS;
  }

  protected getCardNumberError(control: NgModel | undefined): string {
    const v = control?.value;
    if (v == null || String(v).trim() === '') return 'Enter card number';
    return 'Enter 16 digits';
  }

  onSubmit(form: NgForm) {
    if (form.valid && !this.isCardNumberInvalid(this.card.cardNumber)) {
      this.balancesHttpService.createCard(this.card).subscribe({
        next: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Card added',
            life: 3000,
          });
          this.ref.close(true);
        },
        error: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add card',
            life: 3000,
          });
        },
      });
    }
  }

  close(): void {
    this.ref.close();
  }
}
