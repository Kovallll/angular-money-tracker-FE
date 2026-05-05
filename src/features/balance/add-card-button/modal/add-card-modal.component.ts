import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BalancesHttpService, CreateCard } from '@/shared';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { Select } from 'primeng/select';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

const CARD_NUMBER_DIGITS = 16;

@Component({
  selector: 'add-card-modal',
  templateUrl: './add-card-modal.component.html',
  styleUrls: ['./add-card-modal.component.scss'],
  imports: [
    FormsModule,
    InputTextModule,
    AppModalShellComponent,
    MessageModule,
    Select,
    PriceCurrencyFieldComponent,
    TranslatePipe,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCardModalComponent implements OnInit {
  protected readonly messageService = inject(MessageService);
  private readonly balancesHttpService = inject(BalancesHttpService);
  private readonly ref = inject(DynamicDialogRef);
  protected readonly currencyService = inject(CurrencyService);
  protected readonly i18n = inject(I18nService);

  protected card: CreateCard = {
    bankName: '',
    cardType: '',
    cardBalance: 0,
    cardNumber: '',
    cardName: '',
    currencyCode: undefined,
    expiry: undefined,
  };

  protected get cardTypeOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('balances.cardType.credit'), value: 'credit' },
      { label: this.i18n.t('balances.cardType.debit'), value: 'debit' },
      { label: this.i18n.t('balances.cardType.prepaid'), value: 'prepaid' },
      { label: this.i18n.t('balances.cardType.savings'), value: 'savings' },
      { label: this.i18n.t('balances.cardType.cash'), value: 'cash' },
    ];
  }

  protected get paymentOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('balances.paymentSystems.mastercard'), value: 'MasterCard' },
      { label: this.i18n.t('balances.paymentSystems.visa'), value: 'Visa' },
    ];
  }

  ngOnInit(): void {
    if (!this.card.currencyCode) {
      this.card.currencyCode = this.currencyService.primaryCode();
    }
  }

  protected formatExpiry(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    this.card.expiry =
      digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits || undefined;
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
    if (v == null || String(v).trim() === '')
      return this.i18n.t('balances.errors.cardNumberRequired');
    return this.i18n.t('balances.errors.cardNumberDigits');
  }

  onSubmit(form: NgForm) {
    if (form.valid && !this.isCardNumberInvalid(this.card.cardNumber)) {
      this.balancesHttpService.createCard(this.card).subscribe({
        next: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: this.i18n.t('common.success'),
            detail: this.i18n.t('balances.toast.cardAdded'),
            life: 3000,
          });
          this.ref.close(true);
        },
        error: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: this.i18n.t('common.error'),
            detail: this.i18n.t('balances.toast.addCardError'),
            life: 3000,
          });
        },
      });
    }
  }

  isSaveDisabled(form: NgForm | undefined): boolean {
    if (!form) return true;
    return form.invalid || this.isCardNumberInvalid(this.card.cardNumber);
  }

  close(): void {
    this.ref.close();
  }
}
