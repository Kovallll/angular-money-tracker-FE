import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { AppCurrencyPrimaryPipe } from '@/shared/pipes/app-currency-primary.pipe';
import { NextChargeDatePipe } from '@/shared/pipes/next-charge-date.pipe';
import { SubscriptionYearlyPipe } from '@/shared/pipes/subscription-yearly.pipe';
import { DividerComponent } from '@/shared/components/divider/divider';
import { SubscribeItem } from '@/shared';

@Component({
  selector: 'subscribe-card-item',
  standalone: true,
  imports: [
    CommonModule,
    AppCurrencyPrimaryPipe,
    NextChargeDatePipe,
    SubscriptionYearlyPipe,
    DatePipe,
    TitleCasePipe,
    DividerComponent,
  ],
  templateUrl: './subscribe-card-item.component.html',
  styleUrls: ['./subscribe-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCardItemComponent {
  subscribe = input.required<SubscribeItem>();
  isLast = input<boolean>(false);
}
