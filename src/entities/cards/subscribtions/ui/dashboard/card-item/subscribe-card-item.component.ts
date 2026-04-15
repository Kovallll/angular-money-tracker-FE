import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { NextChargeDatePipe } from '@/shared/pipes/next-charge-date.pipe';
import { SubscriptionYearlyPipe } from '@/shared/pipes/subscription-yearly.pipe';
import { SubscribeItem } from '@/shared';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'subscribe-card-item',
  standalone: true,
  imports: [
    CommonModule,
    AppCurrencyPrimaryPipe,
    NextChargeDatePipe,
    SubscriptionYearlyPipe,
    DatePipe,
    TranslateModule,
  ],
  templateUrl: './subscribe-card-item.component.html',
  styleUrls: ['./subscribe-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCardItemComponent {
  subscribe = input.required<SubscribeItem>();
  isLast = input<boolean>(false);

  formatType(type: string | undefined): string {
    const t = (type || '').trim().toLowerCase();
    if (!t) return 'onetime';
    if (t === 'one-time' || t === 'onetime') return 'onetime';
    if (t === 'annually') return 'yearly';
    return t;
  }
}
