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
      panelStyleClass="currency-selector-panel"
      placeholder="Валюта"
    />
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      ::ng-deep .currency-selector {
        min-width: 88px;
      }

      @media (max-width: 779px) {
        ::ng-deep .currency-selector {
          min-width: 68px;
        }
      }

      @media (max-width: 399px) {
        ::ng-deep .currency-selector {
          min-width: 60px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencySelectorComponent {
  readonly currencyService = inject(CurrencyService);
}
