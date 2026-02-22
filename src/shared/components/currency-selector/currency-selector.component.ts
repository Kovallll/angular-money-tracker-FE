import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { CurrencyService } from '@/shared/services/currency/currency.service';

@Component({
  selector: 'app-currency-selector',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    <p-select
      [options]="currencyService.currencies"
      [ngModel]="currencyService.currentCode()"
      (ngModelChange)="currencyService.setCurrency($event)"
      optionLabel="label"
      optionValue="code"
      styleClass="currency-selector"
    />
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      ::ng-deep .currency-selector {
        min-width: 5.5rem;
      }
      ::ng-deep .currency-selector .p-select-label {
        color: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencySelectorComponent {
  readonly currencyService = inject(CurrencyService);
}
