import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { CurrencyService } from '@/shared/services/currency/currency.service';

@Component({
  selector: 'app-price-currency-field',
  standalone: true,
  imports: [FormsModule, InputNumberModule, Select],
  templateUrl: './price-currency-field.component.html',
  styleUrls: ['./price-currency-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceCurrencyFieldComponent {
  private currencyService = inject(CurrencyService);

  readonly currencies = this.currencyService.currencies;

  /** Field label (e.g. "Amount", "Target Budget") */
  label = input<string>('');
  /** Control name for the amount input (for forms) */
  amountName = input<string>('amount');
  /** Whether to show the currency selector. Default true. */
  showCurrency = input<boolean>(true);
  /** When true, show currency as locked read-only text instead of selector. */
  lockCurrency = input<boolean>(false);
  /** Whether the amount is required. */
  required = input<boolean>(false);

  amount = model<number>(0);
  currencyCode = model<string | undefined>(undefined);

  amountTouched = output<void>();

  /** Internal getter/setter so we can default to primary currency when unset */
  get currencyCodeValue(): string {
    const v = this.currencyCode();
    return v != null && v !== '' ? v : this.currencyService.primaryCode();
  }

  set currencyCodeValue(v: string) {
    this.currencyCode.set(v ?? '');
  }

  onAmountBlur() {
    this.amountTouched.emit();
  }
}
