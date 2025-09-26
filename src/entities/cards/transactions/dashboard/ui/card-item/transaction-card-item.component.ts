import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'transaction-card-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, MatIconModule],
  templateUrl: './transaction-card-item.component.html',
  styleUrls: ['./transaction-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCardItemComponent {
  item = input.required<any>();
}
