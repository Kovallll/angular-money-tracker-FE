import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CurrencyService } from '@/shared/services/currency/currency.service';

@Component({
  selector: 'app-price-currency-field',
  standalone: true,
  imports: [FormsModule, InputTextModule, Select],
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

  /** Text in the input; avoids PrimeNG InputNumber which breaks on iOS (keypress/keyCode). */
  readonly amountStr = signal('');

  private readonly amountFieldFocused = signal(false);

  constructor() {
    effect(() => {
      const n = this.amount();
      if (this.amountFieldFocused()) {
        return;
      }
      this.amountStr.set(this.formatAmountDisplay(n));
    });
  }

  /** Internal getter/setter so we can default to primary currency when unset */
  get currencyCodeValue(): string {
    const v = this.currencyCode();
    return v != null && v !== '' ? v : this.currencyService.primaryCode();
  }

  set currencyCodeValue(v: string) {
    this.currencyCode.set(v ?? '');
  }

  onAmountFocus(): void {
    this.amountFieldFocused.set(true);
  }

  onAmountStringChange(raw: string): void {
    const sanitized = this.sanitizeDecimalInput(raw);
    this.amountStr.set(sanitized);
    this.amount.set(this.parseToAmount(sanitized));
  }

  onAmountBlur(): void {
    this.amountFieldFocused.set(false);
    const n = Math.max(0, this.parseToAmount(this.amountStr()));
    const rounded = Math.round(n * 100) / 100;
    this.amount.set(rounded);
    this.amountStr.set(this.formatAmountDisplay(rounded));
    this.amountTouched.emit();
  }

  private formatAmountDisplay(n: number): string {
    if (!Number.isFinite(n) || n === 0) {
      return '';
    }
    const rounded = Math.round(n * 100) / 100;
    if (Number.isInteger(rounded)) {
      return String(rounded);
    }
    const s = rounded.toFixed(2);
    return s.replace(/\.?0+$/, '') || '0';
  }

  private sanitizeDecimalInput(v: string): string {
    let t = v.replace(/,/g, '.');
    t = t.replace(/[^\d.]/g, '');
    const di = t.indexOf('.');
    if (di === -1) {
      return t;
    }
    const intPart = t.slice(0, di);
    let frac = t.slice(di + 1).replace(/\./g, '');
    frac = frac.slice(0, 2);
    return intPart + '.' + frac;
  }

  private parseToAmount(s: string): number {
    const t = s.trim().replace(/,/g, '.');
    if (t === '' || t === '.') {
      return 0;
    }
    const firstDot = t.indexOf('.');
    let normalized: string;
    if (firstDot === -1) {
      normalized = t.replace(/[^\d]/g, '');
    } else {
      const intPart = t.slice(0, firstDot).replace(/[^\d]/g, '');
      const fracPart = t
        .slice(firstDot + 1)
        .replace(/[^\d]/g, '')
        .slice(0, 2);
      normalized = fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart + '.';
    }
    if (normalized === '' || normalized === '.') {
      return 0;
    }
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
  }
}
