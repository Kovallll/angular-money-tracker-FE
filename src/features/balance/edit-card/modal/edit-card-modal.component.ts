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
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

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
    TranslateModule,
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
  readonly i18n = inject(I18nService);

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

  get paymentOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('balances.paymentSystems.mastercard'), value: 'MasterCard' },
      { label: this.i18n.t('balances.paymentSystems.visa'), value: 'Visa' },
    ];
  }

  get cardTypeOptions() {
    this.i18n.currentLang();
    return [
      { label: this.i18n.t('balances.cardType.credit'), value: 'credit' },
      { label: this.i18n.t('balances.cardType.debit'), value: 'debit' },
      { label: this.i18n.t('balances.cardType.prepaid'), value: 'prepaid' },
      { label: this.i18n.t('balances.cardType.savings'), value: 'savings' },
      { label: this.i18n.t('balances.cardType.cash'), value: 'cash' },
    ];
  }

  private normalizeCardType(value: string | null | undefined): string {
    const raw = String(value ?? '')
      .trim()
      .toLowerCase();
    const map: Record<string, string> = {
      credit: 'credit',
      debit: 'debit',
      prepaid: 'prepaid',
      savings: 'savings',
      cash: 'cash',
      кредитная: 'credit',
      дебетовая: 'debit',
      предоплаченная: 'prepaid',
      накопительный: 'savings',
      накопительная: 'savings',
      наличные: 'cash',
      cashaccount: 'cash',
    };
    return map[raw] ?? raw;
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.card?.() && this.id) {
      this.balancesHttpService.updateCard(this.id, this.card()!).subscribe({
        next: () => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: this.i18n.t('common.success'),
            detail: this.i18n.t('balances.toast.cardUpdated'),
            life: 3000,
          });
          form.resetForm();
          this.ref.close();
        },
        error: (err) => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: this.i18n.t('common.error'),
            detail: this.i18n.t('balances.toast.updateCardError'),
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

  onCardTypeChange(value: string): void {
    this.card.update((c) => ({ ...c, cardType: value }));
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id = id;
    this.balancesHttpService.getCard(id).subscribe((card) => {
      this.card.set({
        bankName: card.bankName,
        cardType: this.normalizeCardType(card.cardType),
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
